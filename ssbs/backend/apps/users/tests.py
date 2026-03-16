from unittest.mock import MagicMock, patch
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User
from apps.stations.models import Station


class OAuth42LoginViewTest(TestCase):
    """Tests for GET /api/v1/auth/42/login/"""

    def setUp(self):
        self.client = APIClient()

    def test_returns_authorization_url(self):
        response = self.client.get('/api/v1/auth/42/login/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('authorization_url', response.data)
        self.assertIn('api.intra.42.fr', response.data['authorization_url'])
        self.assertIn('response_type=code', response.data['authorization_url'])


class OAuth42CallbackViewTest(TestCase):
    """Tests for GET /api/v1/auth/42/callback/?code=xxx"""

    def setUp(self):
        self.client = APIClient()

    def assert_callback_redirect(self, response, expected_role, expected_login):
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('/auth/callback#', response.url)

        parsed = urlparse(response.url)
        fragment = parse_qs(parsed.fragment)
        self.assertEqual(fragment['role'][0], expected_role)
        self.assertEqual(fragment['login'][0], expected_login)
        self.assertIn('access', fragment)
        self.assertIn('refresh', fragment)

    def test_missing_code_returns_400(self):
        response = self.client.get('/api/v1/auth/42/callback/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('apps.users.views.requests.get')
    @patch('apps.users.views.requests.post')
    def test_successful_callback_creates_user_and_returns_tokens(self, mock_post, mock_get):
        # Mock 42 token exchange
        mock_token_response = MagicMock()
        mock_token_response.status_code = 200
        mock_token_response.json.return_value = {'access_token': 'fake-42-token'}
        mock_post.return_value = mock_token_response

        # Mock 42 profile fetch
        mock_profile_response = MagicMock()
        mock_profile_response.status_code = 200
        mock_profile_response.json.return_value = {
            'login': 'testuser42',
            'email': 'test@student.42.fr',
        }
        mock_get.return_value = mock_profile_response

        response = self.client.get('/api/v1/auth/42/callback/', {'code': 'valid-code'})

        self.assert_callback_redirect(response, 'STUDENT', 'testuser42')

        # Verify user was created in DB
        user = User.objects.get(login_42='testuser42')
        self.assertEqual(user.email, 'test@student.42.fr')
        self.assertEqual(user.role, 'STUDENT')

    @patch('apps.users.views.requests.get')
    @patch('apps.users.views.requests.post')
    def test_callback_returns_existing_user(self, mock_post, mock_get):
        # Pre-create user
        User.objects.create_user(
            email='existing@student.42.fr',
            login_42='existinguser',
            role='STUDENT',
        )

        mock_token_response = MagicMock()
        mock_token_response.status_code = 200
        mock_token_response.json.return_value = {'access_token': 'fake-token'}
        mock_post.return_value = mock_token_response

        mock_profile_response = MagicMock()
        mock_profile_response.status_code = 200
        mock_profile_response.json.return_value = {
            'login': 'existinguser',
            'email': 'existing@student.42.fr',
        }
        mock_get.return_value = mock_profile_response

        response = self.client.get('/api/v1/auth/42/callback/', {'code': 'valid-code'})

        self.assert_callback_redirect(response, 'STUDENT', 'existinguser')
        self.assertEqual(User.objects.filter(login_42='existinguser').count(), 1)

    @patch('apps.users.views.ADMIN_42_LOGIN', 'admin42')
    @patch('apps.users.views.requests.get')
    @patch('apps.users.views.requests.post')
    def test_admin_login_gets_logistics_staff_role(self, mock_post, mock_get):
        mock_token_response = MagicMock()
        mock_token_response.status_code = 200
        mock_token_response.json.return_value = {'access_token': 'fake-token'}
        mock_post.return_value = mock_token_response

        mock_profile_response = MagicMock()
        mock_profile_response.status_code = 200
        mock_profile_response.json.return_value = {
            'login': 'admin42',
            'email': 'admin@student.42.fr',
        }
        mock_get.return_value = mock_profile_response

        response = self.client.get('/api/v1/auth/42/callback/', {'code': 'valid-code'})

        self.assert_callback_redirect(response, 'LOGISTICS_STAFF', 'admin42')

    @patch('apps.users.views.requests.post')
    def test_failed_token_exchange_returns_502(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = 'invalid_grant'
        mock_post.return_value = mock_response

        response = self.client.get('/api/v1/auth/42/callback/', {'code': 'bad-code'})
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(response.data['error'], 'Failed to obtain access token from 42.')


class TokenRefreshViewTest(TestCase):
    """Tests for POST /api/v1/auth/token/refresh/"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='refresh@test.com',
            password='testpass123',
            login_42='refreshuser',
        )

    def test_valid_refresh_returns_new_access_token(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)

        response = self.client.post(
            '/api/v1/auth/token/refresh/',
            {'refresh': str(refresh)},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_invalid_refresh_returns_401(self):
        response = self.client.post(
            '/api/v1/auth/token/refresh/',
            {'refresh': 'invalid-token'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileViewTest(TestCase):
    """Tests for GET/PATCH /api/v1/auth/me/"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='profile@test.com',
            password='testpass123',
            login_42='profileuser',
            role='STUDENT',
        )
        self.station = Station.objects.create(name='Station Alpha')

    def test_unauthenticated_returns_401(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_returns_user_data(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@test.com')
        self.assertEqual(response.data['login_42'], 'profileuser')
        self.assertEqual(response.data['role'], 'STUDENT')

    def test_patch_station_updates_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            '/api/v1/auth/me/',
            {'station': str(self.station.id)},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data['station']), str(self.station.id))
        self.assertEqual(response.data['station_name'], 'Station Alpha')

    def test_cannot_change_role_via_patch(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            '/api/v1/auth/me/',
            {'role': 'LOGISTICS_STAFF'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Role should remain STUDENT because it's read-only
        self.assertEqual(response.data['role'], 'STUDENT')

    def test_cannot_change_email_via_patch(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            '/api/v1/auth/me/',
            {'email': 'hacked@evil.com'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Email should not change
        self.assertEqual(response.data['email'], 'profile@test.com')


class PermissionsTest(TestCase):
    """Tests for custom permission classes."""

    def setUp(self):
        self.client = APIClient()

    def test_logistics_staff_can_access_profile(self):
        user = User.objects.create_user(
            email='staff@test.com',
            password='testpass123',
            role='LOGISTICS_STAFF',
        )
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_driver_can_access_profile(self):
        user = User.objects.create_user(
            email='driver@test.com',
            password='testpass123',
            role='DRIVER',
        )
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
