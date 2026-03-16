import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	title = models.CharField(max_length=200)
	message = models.TextField()
	target_role = models.CharField(
		max_length=20,
		choices=[
			('STUDENT', 'Student'),
			('LOGISTICS_STAFF', 'Logistics Staff'),
			('DRIVER', 'Driver'),
		],
		null=True,
		blank=True,
	)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.title
