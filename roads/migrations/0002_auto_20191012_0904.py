# Generated by Django 2.2.3 on 2019-10-12 03:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roads', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='data',
            name='speed',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='data',
            name='hits',
            field=models.PositiveSmallIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='data',
            name='ldr',
            field=models.IntegerField(null=True),
        ),
    ]
