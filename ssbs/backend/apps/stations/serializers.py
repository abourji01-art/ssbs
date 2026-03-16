from rest_framework import serializers

from apps.stations.models import Station


class StationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Station
		fields = ['id', 'name', 'created_at']
		read_only_fields = ['id', 'created_at']
