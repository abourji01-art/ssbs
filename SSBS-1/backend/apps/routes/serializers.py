from django.db import transaction
from rest_framework import serializers

from apps.routes.models import Route, RouteStation
from apps.stations.models import Station
from apps.stations.serializers import StationSerializer


class RouteStationSerializer(serializers.ModelSerializer):
	station = StationSerializer()

	class Meta:
		model = RouteStation
		fields = ['order', 'station']


class RouteSerializer(serializers.ModelSerializer):
	stations = RouteStationSerializer(source='route_stations', many=True, read_only=True)
	station_ids = serializers.ListField(
		child=serializers.UUIDField(),
		write_only=True,
		required=False,
	)

	class Meta:
		model = Route
		fields = ['id', 'name', 'window', 'created_at', 'stations', 'station_ids']
		read_only_fields = ['id', 'created_at', 'stations']

	def validate_station_ids(self, value):
		if not value:
			raise serializers.ValidationError('A route must have at least one station.')
		return value

	def _update_route_stations(self, route, station_ids):
		stations = list(Station.objects.filter(id__in=station_ids))
		if len(stations) != len(set(station_ids)):
			raise serializers.ValidationError('One or more stations do not exist or are duplicated.')

		station_map = {station.id: station for station in stations}
		route.route_stations.all().delete()
		RouteStation.objects.bulk_create(
			[
				RouteStation(
					route=route,
					station=station_map[station_id],
					order=index + 1,
				)
				for index, station_id in enumerate(station_ids)
			]
		)

	def create(self, validated_data):
		station_ids = validated_data.pop('station_ids', None)
		if station_ids is None:
			raise serializers.ValidationError({'station_ids': 'A route must have at least one station.'})

		with transaction.atomic():
			route = Route.objects.create(**validated_data)
			self._update_route_stations(route, station_ids)
		return route

	def update(self, instance, validated_data):
		station_ids = validated_data.pop('station_ids', None)
		for attr, value in validated_data.items():
			setattr(instance, attr, value)

		with transaction.atomic():
			instance.save()
			if station_ids is not None:
				if not station_ids:
					raise serializers.ValidationError({'station_ids': 'A route must have at least one station.'})
				self._update_route_stations(instance, station_ids)
		return instance
