import logging
import os
from urllib.parse import urlencode

import requests
from django.shortcuts import redirect as django_redirect
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

from apps.users.models import User
from apps.users.serializers import (
    OAuth42LoginSerializer,
    TokenResponseSerializer,
    UserAdminSerializer,
    UserSerializer,
)
from apps.users.permissions import IsLogisticsStaff

# ──────────────────────────────────────────────────────────────────────────────
# 42 OAuth settings (using django.conf.settings for Vault compatibility)
# ──────────────────────────────────────────────────────────────────────────────
from django.conf import settings

INTRA_42_CLIENT_ID = getattr(settings, 'INTRA_42_CLIENT_ID', '')
INTRA_42_CLIENT_SECRET = getattr(settings, 'INTRA_42_CLIENT_SECRET', '')
INTRA_42_REDIRECT_URI = getattr(settings, 'INTRA_42_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/42/callback/')
INTRA_42_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
INTRA_42_TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
INTRA_42_USER_URL = 'https://api.intra.42.fr/v2/me'

ADMIN_42_LOGIN = getattr(settings, 'ADMIN_42_LOGIN', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')


def build_frontend_callback_url(request, access_token, refresh_token, user_data):
    forwarded_proto = request.headers.get('X-Forwarded-Proto')
    forwarded_host = request.headers.get('X-Forwarded-Host') or request.get_host()

    if forwarded_proto and forwarded_host:
        base_url = f'{forwarded_proto}://{forwarded_host}'
    else:
        base_url = FRONTEND_URL.rstrip('/')

    return (
        f'{base_url}/auth/callback'
        f'#access={access_token}'
        f'&refresh={refresh_token}'
        f'&role={user_data.get("role", "")}'
        f'&login={user_data.get("login_42", "")}'
    )


class OAuth42LoginView(APIView):
    """
    GET /api/v1/auth/42/login/

    Returns the 42 Intra OAuth authorization URL.
    The frontend redirects the user's browser to this URL.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        params = {
            'client_id': INTRA_42_CLIENT_ID,
            'redirect_uri': INTRA_42_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'public',
        }
        authorization_url = f'{INTRA_42_AUTHORIZE_URL}?{urlencode(params)}'
        return Response(
            {'authorization_url': authorization_url},
            status=status.HTTP_200_OK,
        )


class OAuth42CallbackView(APIView):
    """
    GET /api/v1/auth/42/callback/?code=<authorization_code>

    1. Exchanges the authorization code for a 42 access token.
    2. Fetches the user's 42 profile (login, email).
    3. Creates or retrieves the local User record.
    4. Assigns LOGISTICS_STAFF role if login matches ADMIN_42_LOGIN.
    5. Issues a JWT pair (access + refresh) and returns it with the user profile.

    The frontend is responsible for storing the tokens in localStorage and
    redirecting the user based on their role and station.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'Missing authorization code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Step 1: Exchange code for 42 access token ────────────────────
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': INTRA_42_CLIENT_ID,
            'client_secret': INTRA_42_CLIENT_SECRET,
            'code': code,
            'redirect_uri': INTRA_42_REDIRECT_URI,
        }
        token_response = requests.post(INTRA_42_TOKEN_URL, data=token_data, timeout=10)
        if token_response.status_code != 200:
            logger.error(
                '42 token exchange failed: status=%s body=%s redirect_uri=%s',
                token_response.status_code,
                token_response.text,
                INTRA_42_REDIRECT_URI,
            )
            return Response(
                {'error': 'Failed to obtain access token from 42.',
                 'detail': token_response.text},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        access_token_42 = token_response.json().get('access_token')

        # ── Step 2: Fetch 42 user profile ────────────────────────────────
        headers = {'Authorization': f'Bearer {access_token_42}'}
        profile_response = requests.get(INTRA_42_USER_URL, headers=headers, timeout=10)
        if profile_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch user profile from 42.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        profile = profile_response.json()
        login_42 = profile.get('login')
        email = profile.get('email')

        if not login_42 or not email:
            return Response(
                {'error': 'Incomplete profile data from 42.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ── Step 3: Get or create local user ─────────────────────────────
        role = 'LOGISTICS_STAFF' if login_42 == ADMIN_42_LOGIN else 'STUDENT'

        user, created = User.objects.get_or_create(
            login_42=login_42,
            defaults={
                'email': email,
                'role': role,
            },
        )

        # If user existed but email changed on 42 side, update it
        if not created and user.email != email:
            user.email = email
            user.save(update_fields=['email'])

        # Promote to staff if login matches admin login and role was wrong
        if login_42 == ADMIN_42_LOGIN and user.role != 'LOGISTICS_STAFF':
            user.role = 'LOGISTICS_STAFF'
            user.is_staff = True
            user.save(update_fields=['role', 'is_staff'])

        # ── Step 4: Issue JWT tokens ─────────────────────────────────────
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        # If the browser hit this endpoint directly (42 redirected here),
        # redirect to the frontend with tokens in the URL fragment.
        # The frontend reads them from the hash and stores them.
        access_tok = str(refresh.access_token)
        refresh_tok = str(refresh)
        frontend_callback = build_frontend_callback_url(
            request,
            access_tok,
            refresh_tok,
            user_data,
        )
        return django_redirect(frontend_callback)


class ProfileView(APIView):
    """
    GET  /api/v1/auth/me/   — Return current user's profile.
    PATCH /api/v1/auth/me/  — Update allowed fields (station).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    """
    GET /api/v1/auth/users/ — List all users (logistics staff only).
    """
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsLogisticsStaff]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/auth/users/<id>/ — View a user.
    PATCH  /api/v1/auth/users/<id>/ — Edit role, station, is_active.
    DELETE /api/v1/auth/users/<id>/ — Delete a user.
    Logistics staff only.
    """
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsLogisticsStaff]
