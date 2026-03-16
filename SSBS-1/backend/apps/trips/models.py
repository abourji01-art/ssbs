from uuid import uuid4

from django.db import models


class Trip(models.Model):
	"""Represents a scheduled bus trip for a specific route and driver."""

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	route = models.ForeignKey('routes.Route', on_delete=models.PROTECT)
	bus = models.ForeignKey('buses.Bus', on_delete=models.PROTECT)
	driver = models.ForeignKey('drivers.Driver', on_delete=models.PROTECT)
	departure_datetime = models.DateTimeField()
	archived_at = models.DateTimeField(null=True, blank=True, default=None)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['departure_datetime']

	@property
	def seats_left(self):
		return self.bus.seat_capacity - self.reservations.count()

	def __str__(self):
		return f"{self.route.name} @ {self.departure_datetime.isoformat()}"
