from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0003_alter_userstat_avatar_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='watchlistitem',
            name='status',
            field=models.CharField(
                choices=[
                    ('planning', 'Planning'),
                    ('watching', 'Watching'),
                    ('completed', 'Completed'),
                    ('on_hold', 'On Hold'),
                    ('dropped', 'Dropped'),
                ],
                default='planning',
                max_length=20,
            ),
        ),
    ]
