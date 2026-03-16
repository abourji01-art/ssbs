from django.urls import path

from apps.routes.views import RouteDetailView, RouteListCreateView

urlpatterns = [
	path('', RouteListCreateView.as_view(), name='route-list-create'),
	path('<uuid:pk>/', RouteDetailView.as_view(), name='route-detail'),
]
