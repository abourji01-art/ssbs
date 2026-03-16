from django.urls import path

from apps.drivers.views import DriverDetailView, DriverListCreateView

urlpatterns = [
	path('', DriverListCreateView.as_view(), name='driver-list-create'),
	path('<uuid:pk>/', DriverDetailView.as_view(), name='driver-detail'),
]
