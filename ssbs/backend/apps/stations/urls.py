from django.urls import path

from apps.stations.views import StationDetailView, StationListCreateView

urlpatterns = [
	path('', StationListCreateView.as_view(), name='station-list-create'),
	path('<uuid:pk>/', StationDetailView.as_view(), name='station-detail'),
]
