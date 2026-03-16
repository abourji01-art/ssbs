from django.apps import apps
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.buses.models import Bus
from apps.buses.serializers import BusSerializer
from apps.users.permissions import IsLogisticsStaff


class BusListCreateView(generics.ListCreateAPIView):
	queryset = Bus.objects.all()
	serializer_class = BusSerializer

	def get_permissions(self):
		if self.request.method == 'GET':
			return [IsAuthenticated()]
		return [IsLogisticsStaff()]


class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Bus.objects.all()
	serializer_class = BusSerializer

	def get_permissions(self):
		if self.request.method == 'GET':
			return [IsAuthenticated()]
		return [IsLogisticsStaff()]

	def delete(self, request, *args, **kwargs):
		instance = self.get_object()
		Trip = apps.get_model('trips', 'Trip')
		if Trip.objects.filter(bus=instance).exists():
			return Response(
				{'detail': 'Bus is referenced by one or more trips.'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		self.perform_destroy(instance)
		return Response(status=status.HTTP_204_NO_CONTENT)
