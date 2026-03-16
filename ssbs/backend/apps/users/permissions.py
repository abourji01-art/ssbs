import os

from rest_framework.permissions import BasePermission


class HasAPIKey(BasePermission):
    """Allow access only to requests that include a valid X-API-Key header."""

    def has_permission(self, request, view):
        api_key = request.headers.get('X-API-Key', '')
        expected_key = os.environ.get('SSBS_API_KEY', '')
        return api_key and expected_key and api_key == expected_key


class IsLogisticsStaff(BasePermission):
    """Allow access only to users with role=LOGISTICS_STAFF."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'LOGISTICS_STAFF'
        )


class IsStudent(BasePermission):
    """Allow access only to users with role=STUDENT."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'STUDENT'
        )


class IsDriver(BasePermission):
    """Allow access only to users with role=DRIVER."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'DRIVER'
        )


class IsLogisticsStaffOrReadOnly(BasePermission):
    """Staff can do anything; others can only read (GET, HEAD, OPTIONS)."""

    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'LOGISTICS_STAFF'
        )
