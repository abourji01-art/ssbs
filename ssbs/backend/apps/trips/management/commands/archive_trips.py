from datetime import timedelta
import logging

from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils.timezone import now

from apps.trips.models import Trip

logger = logging.getLogger('archive_trips')


class Command(BaseCommand):
    help = 'Archive trips that have reservations and departed more than 25 minutes ago.'

    def handle(self, *args, **kwargs):
        cutoff = now() - timedelta(minutes=25)

        trips_to_archive = Trip.objects.filter(
            departure_datetime__lte=cutoff,
            archived_at__isnull=True,
        ).annotate(
            reservation_count=Count('reservations')
        ).filter(
            reservation_count__gt=0
        )

        count = trips_to_archive.count()

        if count > 0:
            trips_to_archive.update(archived_at=now())
            msg = f'Archived {count} trip(s).'
            logger.info(msg)
            self.stdout.write(self.style.SUCCESS(msg))
        else:
            logger.info('archive_trips ran — no trips to archive.')
            self.stdout.write('No trips to archive.')
