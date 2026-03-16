from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import CapacityError, LifecycleError
from apps.reservations.models import Reservation
from apps.reservations.serializers import ReservationSerializer
from apps.trips.models import Trip


class ReservationListCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
			reservations = Reservation.objects.filter(trip__archived_at__isnull=True)
		else:
			# Force filtering by the authenticated user's ID
			reservations = Reservation.objects.filter(
				student=request.user,
				trip__archived_at__isnull=True,
			)

		serializer = ReservationSerializer(reservations, many=True)
		return Response(serializer.data)

	def post(self, request):
		trip_id = request.data.get('trip')
		if not trip_id:
			return Response(
				{'detail': 'trip is required.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
			return Response(
				{'detail': 'Logistics staff cannot create reservations.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		if getattr(request.user, 'role', None) != 'STUDENT':
			return Response(
				{'detail': 'Only students can create reservations.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		try:
			with transaction.atomic():
				trip = Trip.objects.select_for_update().select_related('bus').get(id=trip_id)

				if trip.archived_at is not None:
					raise LifecycleError('Trip is no longer available.')

				if trip.seats_left <= 0:
					raise CapacityError('No seats available.')

				try:
					reservation = Reservation.objects.create(trip=trip, student=request.user)
				except IntegrityError:
					return Response(
						{'detail': 'Already reserved.'},
						status=status.HTTP_400_BAD_REQUEST,
					)
		except Trip.DoesNotExist:
			return Response({'detail': 'Trip not found.'}, status=status.HTTP_404_NOT_FOUND)

		serializer = ReservationSerializer(reservation)
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReservationDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, pk):
		try:
			if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
				reservation = Reservation.objects.select_related('trip').get(id=pk)
			else:
				reservation = Reservation.objects.select_related('trip').get(id=pk, student=request.user)
		except Reservation.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)

		if reservation.trip.archived_at is not None:
			raise LifecycleError('Cannot cancel a reservation for an archived trip.')

		reservation.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class ReservationHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
			reservations = Reservation.objects.filter(trip__archived_at__isnull=False)
		else:
			# Force filtering by the authenticated user's ID
			reservations = Reservation.objects.filter(
				student=request.user,
				trip__archived_at__isnull=False,
			)

		serializer = ReservationSerializer(reservations, many=True)
		return Response(serializer.data)
