from django.db import models
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationListCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		user = request.user
		qs = Notification.objects.all()
		# Filter by user role if not staff
		if user.role != 'LOGISTICS_STAFF':
			qs = qs.filter(
				models.Q(target_role=user.role) | models.Q(target_role__isnull=True)
			)
		serializer = NotificationSerializer(qs, many=True)
		return Response(serializer.data)

	def post(self, request):
		if request.user.role != 'LOGISTICS_STAFF':
			return Response(
				{'error': 'Only staff can create notifications'},
				status=status.HTTP_403_FORBIDDEN,
			)
		serializer = NotificationSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def get_object(self, pk):
		return Notification.objects.get(pk=pk)

	def patch(self, request, pk):
		try:
			notification = self.get_object(pk)
		except Notification.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		serializer = NotificationSerializer(notification, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)

	def delete(self, request, pk):
		if request.user.role != 'LOGISTICS_STAFF':
			return Response(
				{'error': 'Only staff can delete notifications'},
				status=status.HTTP_403_FORBIDDEN,
			)
		try:
			notification = self.get_object(pk)
		except Notification.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		notification.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
