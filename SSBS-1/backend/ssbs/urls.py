# backend/ssbs/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/stations/', include('apps.stations.urls')),
    path('api/v1/buses/', include('apps.buses.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/trips/', include('apps.trips.urls')),
    path('api/v1/reservations/', include('apps.reservations.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/drivers/', include('apps.drivers.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
