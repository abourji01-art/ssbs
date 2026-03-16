from uuid import uuid4

from django.db import models


class Route(models.Model):
	"""Represents an ordered list of stations serving a specific window."""

	WINDOW_CHOICES = [
		('peak', 'Peak'),
		('consolidated', 'Consolidated'),
	]

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	name = models.CharField(max_length=100, unique=True)
	window = models.CharField(max_length=20, choices=WINDOW_CHOICES)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return self.name


class RouteStation(models.Model):
	"""Join table storing station order for a route."""

	route = models.ForeignKey(
		'routes.Route',
		on_delete=models.CASCADE,
		related_name='route_stations',
	)
	station = models.ForeignKey('stations.Station', on_delete=models.PROTECT)
	order = models.PositiveIntegerField()

	class Meta:
		unique_together = [('route', 'order'), ('route', 'station')]
		ordering = ['order']

	def __str__(self):
		return f"{self.route.name} — {self.station.name} (#{self.order})"
