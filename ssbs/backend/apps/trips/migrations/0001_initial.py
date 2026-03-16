from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('routes', '0001_initial'),
        ('buses', '0001_initial'),
        ('drivers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('departure_datetime', models.DateTimeField()),
                ('seats', models.PositiveIntegerField()),
                ('archived_at', models.DateTimeField(blank=True, default=None, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bus', models.ForeignKey(on_delete=models.PROTECT, to='buses.bus')),
                ('driver', models.ForeignKey(on_delete=models.PROTECT, to='drivers.driver')),
                ('route', models.ForeignKey(on_delete=models.PROTECT, to='routes.route')),
            ],
            options={'ordering': ['departure_datetime']},
        ),
    ]
