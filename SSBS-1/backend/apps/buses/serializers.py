from rest_framework import serializers

from apps.buses.models import Bus


class BusSerializer(serializers.ModelSerializer):
	class Meta:
		model = Bus
		fields = ['id', 'name', 'plate', 'seat_capacity', 'created_at']
		read_only_fields = ['id', 'created_at']
