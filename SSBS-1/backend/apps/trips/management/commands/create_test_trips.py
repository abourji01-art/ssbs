from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils.timezone import now

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route
from apps.trips.models import Trip


def create_test_trips():
    route = Route.objects.first()
    bus = Bus.objects.first()
    driver = Driver.objects.first()

    if not route or not bus or not driver:
        print("❌ No route, bus, or driver found. Create them first via the admin panel.")
        return

    current_time = now()

    trip1 = Trip.objects.create(
        route=route,
        bus=bus,
        driver=driver,
        departure_datetime=current_time + timedelta(minutes=5),
    )

    trip2 = Trip.objects.create(
        route=route,
        bus=bus,
        driver=driver,
        departure_datetime=current_time + timedelta(minutes=30),
    )

    trip3 = Trip.objects.create(
        route=route,
        bus=bus,
        driver=driver,
        departure_datetime=current_time + timedelta(hours=1),
    )

    print(f"✅ Test trips created — departing in 5min ({trip1.id}), 30min ({trip2.id}), 1hr ({trip3.id})")
    print(f"   Route: {route.name} | Bus: {bus.name} ({bus.plate}) | Driver: {driver.name}")


class Command(BaseCommand):
    help = 'Create test trips starting from now for testing'

    def handle(self, *args, **kwargs):
        create_test_trips()
        self.stdout.write(self.style.SUCCESS('Test trips created successfully'))
