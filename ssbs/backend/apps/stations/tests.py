from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.routes.models import Route, RouteStation
from apps.stations.models import Station
from apps.users.models import User


class StationAPITests(APITestCase):
	def setUp(self):
		self.list_url = reverse('station-list-create')
		# Create both authenticated user for GET and logistics staff for POST/PUT/DELETE
		self.student_user = User.objects.create_user(
			email='student@test.com',
			password='testpass123',
			login_42='studentuser',
			role='STUDENT',
		)
		self.logistics_user = User.objects.create_user(
			email='logistics@test.com',
			password='testpass123',
			login_42='logisticsuser',
			role='LOGISTICS_STAFF',
		)

	def test_create_station_success(self):
		self.client.force_authenticate(user=self.logistics_user)
		response = self.client.post(self.list_url, {'name': 'OCP Saka'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Station.objects.filter(name='OCP Saka').exists())

	def test_create_station_duplicate_name(self):
		self.client.force_authenticate(user=self.logistics_user)
		Station.objects.create(name='Posto Gosto')
		response = self.client.post(self.list_url, {'name': 'Posto Gosto'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_list_stations_returns_all(self):
		self.client.force_authenticate(user=self.student_user)  # Any authenticated user can GET
		Station.objects.create(name='Station A')
		Station.objects.create(name='Station B')
		response = self.client.get(self.list_url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 2)

	def test_delete_station_without_route_reference(self):
		self.client.force_authenticate(user=self.logistics_user)
		station = Station.objects.create(name='Standalone')
		url = reverse('station-detail', args=[station.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Station.objects.filter(id=station.id).exists())

	def test_delete_station_with_route_reference_returns_400(self):
		self.client.force_authenticate(user=self.logistics_user)
		station = Station.objects.create(name='Shared Stop')
		route = Route.objects.create(name='Route A', window='peak')
		RouteStation.objects.create(route=route, station=station, order=1)
		url = reverse('station-detail', args=[station.id])

		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertTrue(Station.objects.filter(id=station.id).exists())
