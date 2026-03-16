from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('stations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('window', models.CharField(choices=[('peak', 'Peak'), ('consolidated', 'Consolidated')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='RouteStation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField()),
                ('route', models.ForeignKey(on_delete=models.CASCADE, related_name='route_stations', to='routes.route')),
                ('station', models.ForeignKey(on_delete=models.PROTECT, to='stations.station')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.AlterUniqueTogether(
            name='routestation',
            unique_together={('route', 'order'), ('route', 'station')},
        ),
    ]
