from django.db import models
from django.conf import settings
from uuid import uuid4

class IncidentReport(models.Model):
	CATEGORY_CHOICES = [
		('late', 'Bus is Late'),
		('no_show', 'Bus Did Not Show Up'),
		('full', 'Bus was Full'),
		('accident', 'Accident / Breakdown'),
		('other', 'Other'),
	]
	
	STATUS_CHOICES = [
		('pending', 'Pending Review'),
		('resolved', 'Resolved'),
	]

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	reporter = models.ForeignKey(
		settings.AUTH_USER_MODEL, 
		on_delete=models.CASCADE,
		related_name='reports'
	)
	trip = models.ForeignKey(
		'trips.Trip', 
		on_delete=models.SET_NULL, 
		null=True, 
		blank=True,
		related_name='reports'
	)
	category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
	description = models.TextField(blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.get_category_display()} by {self.reporter.username}"
