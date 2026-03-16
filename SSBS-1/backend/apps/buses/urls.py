from django.urls import path

from apps.buses.views import BusDetailView, BusListCreateView

urlpatterns = [
	path('', BusListCreateView.as_view(), name='bus-list-create'),
	path('<uuid:pk>/', BusDetailView.as_view(), name='bus-detail'),
]
