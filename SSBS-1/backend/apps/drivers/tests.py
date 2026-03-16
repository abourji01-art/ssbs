from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.trips.models import Trip
from apps.users.models import User


class DriverAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('driver-list-create')
		self.user = User.objects.create_user(
			email='logistics@test.com',
			password='testpass123',
			login_42='logisticsuser',
			role='LOGISTICS_STAFF',
		)
		self.client.force_authenticate(user=self.user)

	def _create_trip_with_driver(self, driver):
		route = Route.objects.create(name='Route A', window='peak')
		bus = Bus.objects.create(name='Bus 1', plate='DRV-001', seat_capacity=20)
		return Trip.objects.create(
			route=route,
			bus=bus,
			driver=driver,
			departure_datetime='2026-01-01T21:00:00Z',
		)

	def test_create_driver_hashes_password(self):
		payload = {'name': 'Driver One', 'username': 'driver1', 'password': 'Secret123'}
		response = self.client.post(self.list_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		driver = Driver.objects.get(id=response.data['id'])
		self.assertNotEqual(driver.password, 'Secret123')
		self.assertNotIn('password', response.data)

	def test_partial_update_without_password_keeps_existing_hash(self):
		driver = Driver.objects.create(name='Driver Two', username='driver2', password='hash', status='active')
		url = reverse('driver-detail', args=[driver.id])
		response = self.client.patch(url, {'name': 'Updated Name'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		driver.refresh_from_db()
		self.assertEqual(driver.name, 'Updated Name')
		self.assertEqual(driver.password, 'hash')

	def test_partial_update_with_password_rehashes_value(self):
		driver = Driver.objects.create(name='Driver Three', username='driver3', password='old-hash')
		url = reverse('driver-detail', args=[driver.id])
		response = self.client.patch(url, {'password': 'NewSecret!'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		driver.refresh_from_db()
		self.assertNotEqual(driver.password, 'old-hash')

	def test_delete_driver_in_use_sets_inactive(self):
		driver = Driver.objects.create(name='Busy Driver', username='driver4', password='hash')
		self._create_trip_with_driver(driver)
		url = reverse('driver-detail', args=[driver.id])

		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		driver.refresh_from_db()
		self.assertEqual(driver.status, 'inactive')

	def test_delete_unused_driver(self):
		driver = Driver.objects.create(name='Free Driver', username='driver5', password='hash')
		url = reverse('driver-detail', args=[driver.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Driver.objects.filter(id=driver.id).exists())
