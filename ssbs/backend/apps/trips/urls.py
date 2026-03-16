from django.urls import path

from apps.trips.views import AvailableTripListView, TripDetailView, TripListCreateView

urlpatterns = [
	path('', TripListCreateView.as_view(), name='trip-list-create'),
	path('available/', AvailableTripListView.as_view(), name='trip-available'),
	path('<uuid:pk>/', TripDetailView.as_view(), name='trip-detail'),
]
