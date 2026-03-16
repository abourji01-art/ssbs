from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from apps.core.exceptions import DomainError


def api_exception_handler(exc, context):
	"""Catch DomainError subclasses and return a clean JSON response."""
	if isinstance(exc, DomainError):
		return Response(
			{'error': exc.message, 'code': exc.code},
			status=exc.status_code,
		)
	return drf_exception_handler(exc, context)
