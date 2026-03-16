from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.trips.models import Trip
from apps.users.models import User


class BusAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('bus-list-create')
		self.user = User.objects.create_user(
			email='logistics@test.com',
			password='testpass123',
			login_42='logisticsuser',
			role='LOGISTICS_STAFF',
		)
		self.client.force_authenticate(user=self.user)

	def _create_trip_with_bus(self, bus):
		route = Route.objects.create(name='Route A', window='peak')
		driver = Driver.objects.create(name='John Doe', username='driver1', password='hashed')
		return Trip.objects.create(
			route=route,
			bus=bus,
			driver=driver,
			departure_datetime='2026-01-01T20:00:00Z',
		)

	def test_create_bus_success(self):
		payload = {'name': 'Bus 1', 'plate': 'ABC-123', 'seat_capacity': 30}
		response = self.client.post(self.list_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Bus.objects.filter(plate='ABC-123').exists())

	def test_create_bus_duplicate_plate(self):
		Bus.objects.create(name='Bus 1', plate='ABC-123', seat_capacity=30)
		response = self.client.post(self.list_url, {'name': 'Bus 2', 'plate': 'ABC-123', 'seat_capacity': 35}, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_delete_unreferenced_bus(self):
		bus = Bus.objects.create(name='Temp', plate='TMP-001', seat_capacity=20)
		url = reverse('bus-detail', args=[bus.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

	def test_delete_referenced_bus_returns_400(self):
		bus = Bus.objects.create(name='InUse', plate='IN-USE', seat_capacity=20)
		self._create_trip_with_bus(bus)
		url = reverse('bus-detail', args=[bus.id])

		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertTrue(Bus.objects.filter(id=bus.id).exists())
