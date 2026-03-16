from uuid import uuid4

from django.conf import settings
from django.db import models


class Reservation(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	trip = models.ForeignKey(
		'trips.Trip',
		on_delete=models.CASCADE,
		related_name='reservations',
	)
	student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = [('trip', 'student')]
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.student_id} → {self.trip_id}"
