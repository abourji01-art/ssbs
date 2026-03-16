from django.urls import path

from apps.reservations.views import (
	ReservationDetailView,
	ReservationHistoryView,
	ReservationListCreateView,
)

urlpatterns = [
	path('', ReservationListCreateView.as_view(), name='reservation-list-create'),
	path('history/', ReservationHistoryView.as_view(), name='reservation-history'),
	path('<uuid:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),
]
