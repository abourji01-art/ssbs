from rest_framework import serializers

from apps.trips.models import Trip


class TripSerializer(serializers.ModelSerializer):
	seats_left = serializers.IntegerField(read_only=True)
	route_name = serializers.CharField(source='route.name', read_only=True)
	bus_name = serializers.CharField(source='bus.name', read_only=True)

	class Meta:
		model = Trip
		fields = [
			'id',
			'route',
			'route_name',
			'bus',
			'bus_name',
			'driver',
			'departure_datetime',
			'seats_left',
			'archived_at',
			'created_at',
		]
		read_only_fields = ['id', 'seats_left', 'archived_at', 'created_at', 'route_name', 'bus_name']
