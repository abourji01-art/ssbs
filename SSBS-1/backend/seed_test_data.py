"""
seed_test_data.py — Create test trips for development/testing.

Usage (inside the Docker container):
    docker-compose exec backend python manage.py create_test_trips

Or directly via Django shell:
    docker-compose exec backend python manage.py shell -c "from apps.trips.management.commands.create_test_trips import create_test_trips; create_test_trips()"
"""
import os
import sys
import django

# Allow running as a standalone script from the backend/ directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.trips.management.commands.create_test_trips import create_test_trips  # noqa: E402

if __name__ == '__main__':
    create_test_trips()
