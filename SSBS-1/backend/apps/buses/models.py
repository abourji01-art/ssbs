from uuid import uuid4

from django.db import models


class Bus(models.Model):
	"""Represents a fleet vehicle available for trips."""

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	name = models.CharField(max_length=100)
	plate = models.CharField(max_length=20, unique=True)
	seat_capacity = models.PositiveIntegerField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return f"{self.name} ({self.plate})"
