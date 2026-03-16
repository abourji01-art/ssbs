from rest_framework import serializers
from apps.reservations.models import Reservation
from apps.trips.serializers import TripSerializer

class ReservationSerializer(serializers.ModelSerializer):
	trip_details = TripSerializer(source='trip', read_only=True)

	class Meta:
		model = Reservation
		fields = ['id', 'trip', 'trip_details', 'student', 'created_at']
		read_only_fields = ['id', 'student', 'created_at', 'trip_details']
