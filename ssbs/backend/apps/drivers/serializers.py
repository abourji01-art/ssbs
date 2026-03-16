from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from apps.drivers.models import Driver


class DriverSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=False)

	class Meta:
		model = Driver
		fields = ['id', 'name', 'username', 'password', 'status', 'default_bus', 'default_routes', 'created_at']
		read_only_fields = ['id', 'created_at']

	def validate(self, attrs):
		if self.instance is None and not attrs.get('password'):
			raise serializers.ValidationError({'password': 'Password is required.'})
		return attrs

	def create(self, validated_data):
		password = validated_data.pop('password')
		validated_data['password'] = make_password(password)
		return super().create(validated_data)

	def update(self, instance, validated_data):
		password = validated_data.pop('password', None)
		if password:
			validated_data['password'] = make_password(password)
		return super().update(instance, validated_data)
