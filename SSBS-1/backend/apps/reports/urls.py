from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views import IncidentReportViewSet

router = DefaultRouter()
router.register(r'', IncidentReportViewSet)

urlpatterns = [
	path('', include(router.urls)),
]
