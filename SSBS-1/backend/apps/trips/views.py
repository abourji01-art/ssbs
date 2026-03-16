import os
from datetime import time, timedelta

from django.db.models import Count, F
from django.utils.timezone import localtime, now
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.routes.models import Route
from apps.trips.models import Trip
from apps.trips.serializers import TripSerializer
from apps.users.permissions import IsLogisticsStaff

TESTING_MODE = os.environ.get('TESTING_MODE', 'false').lower() == 'true'


class TripListCreateView(generics.ListCreateAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsLogisticsStaff]


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsLogisticsStaff]


class AvailableTripListView(APIView):
	"""Browse trips available for a student station (station_id query param)."""

	permission_classes = [IsAuthenticated]

	def get(self, request):
		station_id = request.query_params.get('station_id')
		if not station_id:
			return Response({'detail': 'station_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		now_dt = localtime(now())

		if TESTING_MODE:
			# In testing mode: always return all active trips regardless of current time
			trips = (
				Trip.objects.filter(
					route__route_stations__station_id=station_id,
					departure_datetime__gte=now_dt,
					archived_at__isnull=True,
				)
				.select_related('route', 'bus')
				.annotate(reservation_count=Count('reservations'))
				.filter(reservation_count__lt=F('bus__seat_capacity'))
				.order_by('departure_datetime')
			)
			serializer = TripSerializer(trips, many=True)
			return Response(serializer.data)

		# Production: respect time windows
		# 1. Find the earliest future non-archived trip
		first_trip = Trip.objects.filter(
			route__route_stations__station_id=station_id,
			departure_datetime__gte=now_dt,
			archived_at__isnull=True,
		).order_by('departure_datetime').first()

		if not first_trip:
			return Response([])

		# 2. Determine the "Logical Shift Start Date"
		# A "Night Shift" starts at 20:00 and ends at 06:00 the next day.
		# If the next trip is between 00:00 and 06:00, it belongs to the previous calendar day's shift.
		t_dt = first_trip.departure_datetime
		if t_dt.time() < time(6, 0):
			logical_start_date = t_dt.date() - timedelta(days=1)
		else:
			logical_start_date = t_dt.date()

		# 3. Define the Window: 20:00 on start date to 06:00 the next day
		start_of_window = now_dt.replace(
			year=logical_start_date.year, month=logical_start_date.month, day=logical_start_date.day,
			hour=20, minute=0, second=0, microsecond=0
		)
		end_of_window = (start_of_window + timedelta(days=1)).replace(hour=6, minute=0)

		trips = (
			Trip.objects.filter(
				route__route_stations__station_id=station_id,
				departure_datetime__range=(start_of_window, end_of_window),
				departure_datetime__gte=now_dt,
				archived_at__isnull=True,
			)
			.select_related('route', 'bus')
			.annotate(reservation_count=Count('reservations'))
			.filter(reservation_count__lt=F('bus__seat_capacity'))
			.order_by('departure_datetime')
		)

		serializer = TripSerializer(trips, many=True)
		return Response(serializer.data)
