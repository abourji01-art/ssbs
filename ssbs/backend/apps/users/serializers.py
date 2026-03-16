from rest_framework import serializers

from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    """Read/update serializer for the authenticated user's profile."""
    station_name = serializers.CharField(source='station.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id',
            'login_42',
            'email',
            'role',
            'station',
            'station_name',
            'is_active',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'login_42',
            'email',
            'role',
            'is_active',
            'created_at',
        ]


class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer for logistics staff to view, edit, and delete users."""
    station_name = serializers.CharField(source='station.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id',
            'login_42',
            'email',
            'role',
            'station',
            'station_name',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'login_42', 'email', 'created_at']


class TokenResponseSerializer(serializers.Serializer):
    """Schema-only serializer for the JWT token response (used for docs)."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class OAuth42LoginSerializer(serializers.Serializer):
    """Schema-only serializer for the OAuth login redirect URL."""
    authorization_url = serializers.URLField()
