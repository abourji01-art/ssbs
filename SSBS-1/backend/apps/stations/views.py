from django.apps import apps
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.stations.models import Station
from apps.stations.serializers import StationSerializer
from apps.users.permissions import IsLogisticsStaff


class StationListCreateView(generics.ListCreateAPIView):
	queryset = Station.objects.all()
	serializer_class = StationSerializer

	def get_permissions(self):
		if self.request.method == 'GET':
			return [IsAuthenticated()]
		return [IsLogisticsStaff()]


class StationDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Station.objects.all()
	serializer_class = StationSerializer

	def get_permissions(self):
		if self.request.method == 'GET':
			return [IsAuthenticated()]
		return [IsLogisticsStaff()]

	def delete(self, request, *args, **kwargs):
		instance = self.get_object()
		RouteStation = apps.get_model('routes', 'RouteStation')
		if RouteStation.objects.filter(station=instance).exists():
			return Response(
				{'detail': 'Station is referenced by one or more routes.'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		self.perform_destroy(instance)
		return Response(status=status.HTTP_204_NO_CONTENT)
