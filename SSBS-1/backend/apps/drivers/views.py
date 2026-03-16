from django.apps import apps
from rest_framework import generics, status
from rest_framework.response import Response

from apps.drivers.models import Driver
from apps.drivers.serializers import DriverSerializer
from apps.users.permissions import IsLogisticsStaff


class DriverListCreateView(generics.ListCreateAPIView):
	queryset = Driver.objects.all()
	serializer_class = DriverSerializer
	permission_classes = [IsLogisticsStaff]


class DriverDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Driver.objects.all()
	serializer_class = DriverSerializer
	permission_classes = [IsLogisticsStaff]

	def delete(self, request, *args, **kwargs):
		instance = self.get_object()
		Trip = apps.get_model('trips', 'Trip')
		if Trip.objects.filter(driver=instance).exists():
			instance.status = 'inactive'
			instance.save(update_fields=['status'])
			return Response(
				{'detail': 'Driver is assigned to trips and has been set to inactive.'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		self.perform_destroy(instance)
		return Response(status=status.HTTP_204_NO_CONTENT)
