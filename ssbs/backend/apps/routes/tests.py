from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.stations.models import Station
from apps.trips.models import Trip
from apps.users.models import User


class RouteAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('route-list-create')
		self.station_a = Station.objects.create(name='Station A')
		self.station_b = Station.objects.create(name='Station B')
		self.station_c = Station.objects.create(name='Station C')
		self.user = User.objects.create_user(
			email='logistics@test.com',
			password='testpass123',
			login_42='logisticsuser',
			role='LOGISTICS_STAFF',
		)
		self.client.force_authenticate(user=self.user)

	def test_create_route_requires_station_ids(self):
		payload = {'name': 'Route A', 'window': 'peak'}
		response = self.client.post(self.list_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_create_route_with_stations_success(self):
		payload = {
			'name': 'Route Peak',
			'window': 'peak',
			'station_ids': [str(self.station_a.id), str(self.station_b.id)],
		}
		response = self.client.post(self.list_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		route_id = response.data['id']
		detail_url = reverse('route-detail', args=[route_id])
		detail_response = self.client.get(detail_url)
		self.assertEqual(len(detail_response.data['stations']), 2)
		self.assertEqual(
			[s['station']['name'] for s in detail_response.data['stations']],
			['Station A', 'Station B'],
		)

	def test_update_route_changes_station_order(self):
		route = Route.objects.create(name='Route B', window='peak')
		route.route_stations.create(station=self.station_a, order=1)
		route.route_stations.create(station=self.station_b, order=2)
		url = reverse('route-detail', args=[route.id])
		payload = {
			'name': 'Route B',
			'window': 'peak',
			'station_ids': [str(self.station_b.id), str(self.station_a.id)],
		}
		response = self.client.put(url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		route.refresh_from_db()
		self.assertEqual(
			list(route.route_stations.order_by('order').values_list('station__name', flat=True)),
			['Station B', 'Station A'],
		)

	def test_delete_route_in_use_returns_400(self):
		route = Route.objects.create(name='Route C', window='peak')
		route.route_stations.create(station=self.station_c, order=1)
		bus = Bus.objects.create(name='Bus', plate='BUS-1', seat_capacity=20)
		driver = Driver.objects.create(name='Driver', username='driver-route', password='hash')
		Trip.objects.create(
			route=route,
			bus=bus,
			driver=driver,
			departure_datetime='2026-01-01T22:00:00Z',
		)
		url = reverse('route-detail', args=[route.id])

		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertTrue(Route.objects.filter(id=route.id).exists())
