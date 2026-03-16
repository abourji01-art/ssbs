from django.conf import settings
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('trips', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('student', models.ForeignKey(on_delete=models.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('trip', models.ForeignKey(on_delete=models.CASCADE, related_name='reservations', to='trips.trip')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterUniqueTogether(
            name='reservation',
            unique_together={('trip', 'student')},
        ),
    ]
