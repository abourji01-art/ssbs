from django.urls import path

from apps.notifications.views import NotificationListCreateView, NotificationDetailView

urlpatterns = [
	path('', NotificationListCreateView.as_view(), name='notification-list-create'),
	path('<uuid:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]
