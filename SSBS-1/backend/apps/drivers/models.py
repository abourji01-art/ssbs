from uuid import uuid4

from django.db import models


class Driver(models.Model):
	STATUS_CHOICES = [
		('active', 'Active'),
		('inactive', 'Inactive'),
	]

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	name = models.CharField(max_length=100)
	username = models.CharField(max_length=100, unique=True)
	password = models.CharField(max_length=255)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
	default_bus = models.ForeignKey('buses.Bus', on_delete=models.SET_NULL, null=True, blank=True)
	default_routes = models.ManyToManyField('routes.Route', blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return f"{self.name} ({self.get_status_display()})"
