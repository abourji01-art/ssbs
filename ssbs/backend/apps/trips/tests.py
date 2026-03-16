from datetime import datetime, timezone as dt_timezone
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.reservations.models import Reservation
from apps.routes.models import Route, RouteStation
from apps.stations.models import Station
from apps.trips.models import Trip
from apps.users.models import User


class TripAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('trip-list-create')
		self.available_url = reverse('trip-available')
		self.station = Station.objects.create(name='Station A')
		self.route_peak = Route.objects.create(name='Route Peak', window='peak')
		RouteStation.objects.create(route=self.route_peak, station=self.station, order=1)
		self.bus = Bus.objects.create(name='Bus 1', plate='TRP-001', seat_capacity=10)
		self.driver = Driver.objects.create(name='Driver Trip', username='driver-trip', password='hash')
		# Create users for different permission levels
		self.logistics_user = User.objects.create_user(
			email='logistics@test.com',
			password='testpass123',
			login_42='logisticsuser',
			role='LOGISTICS_STAFF',
		)
		self.student_user = User.objects.create_user(
			email='student@test.com',
			password='testpass123',
			login_42='studentuser',
			role='STUDENT',
		)

	def test_create_trip(self):
		self.client.force_authenticate(user=self.logistics_user)
		payload = {
			'route': str(self.route_peak.id),
			'bus': str(self.bus.id),
			'driver': str(self.driver.id),
			'departure_datetime': '2026-01-01T20:00:00Z',
		}
		response = self.client.post(self.list_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['seats_left'], self.bus.seat_capacity)

	def _create_trip(self, archived=False):
		trip = Trip.objects.create(
			route=self.route_peak,
			bus=self.bus,
			driver=self.driver,
			departure_datetime='2026-01-01T21:00:00Z',
			archived_at=timezone.now() if archived else None,
		)
		return trip

	@patch('apps.trips.views.localtime')
	@patch('apps.trips.views.now')
	def test_available_trips_returns_results_in_peak_window(self, mock_now, mock_localtime):
		self.client.force_authenticate(user=self.student_user)
		trip = Trip.objects.create(
			route=self.route_peak,
			bus=self.bus,
			driver=self.driver,
			departure_datetime='2026-01-01T23:00:00Z',
		)
		fake_time = datetime(2026, 1, 1, 22, 0, tzinfo=dt_timezone.utc)
		mock_now.return_value = fake_time
		mock_localtime.side_effect = lambda value: fake_time

		response = self.client.get(self.available_url, {'station_id': str(self.station.id)})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], str(trip.id))

	@patch('apps.trips.views.localtime')
	@patch('apps.trips.views.now')
	def test_available_trips_returns_next_night_window_outside_active_hours(self, mock_now, mock_localtime):
		self.client.force_authenticate(user=self.student_user)
		trip = self._create_trip()
		fake_time = datetime(2026, 1, 1, 10, 0, tzinfo=dt_timezone.utc)
		mock_now.return_value = fake_time
		mock_localtime.side_effect = lambda value: fake_time

		response = self.client.get(self.available_url, {'station_id': str(self.station.id)})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], str(trip.id))

	def test_available_trips_requires_station_id(self):
		self.client.force_authenticate(user=self.student_user)
		response = self.client.get(self.available_url)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	@patch('apps.trips.views.localtime')
	@patch('apps.trips.views.now')
	def test_full_trips_are_filtered_out(self, mock_now, mock_localtime):
		self.client.force_authenticate(user=self.student_user)
		self.bus.seat_capacity = 1
		self.bus.save(update_fields=['seat_capacity'])
		trip = self._create_trip()
		user = User.objects.create_user(
			email='student@example.com',
			login_42='student_example',
			role='STUDENT'
		)
		Reservation.objects.create(trip=trip, student=user)
		fake_time = datetime(2026, 1, 1, 22, 0, tzinfo=dt_timezone.utc)
		mock_now.return_value = fake_time
		mock_localtime.side_effect = lambda value: fake_time

		response = self.client.get(self.available_url, {'station_id': str(self.station.id)})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data, [])
