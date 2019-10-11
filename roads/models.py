from django.db import models
from django.contrib.auth.models import User
import datetime

# Create your models here.

class Authority(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)


class EmergencyVehicle(models.Model):
    authority = models.OneToOneField(Authority, on_delete=models.SET_NULL, null=True)
    latitude = models.BigIntegerField()
    longitude = models.BigIntegerField()
    destination_latitude = models.BigIntegerField()
    destination_longitude = models.BigIntegerField()


class Road(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    lane_count = models.PositiveSmallIntegerField(default=None, null=True)
    barricade = models.BooleanField(default=False)
    shut_reason = models.TextField(null=True, default=None)


class Sensor(models.Model):
    latitude = models.BigIntegerField()
    longitude = models.BigIntegerField()
    road = models.ForeignKey(Road, on_delete=models.CASCADE)

    def __str__(self):

        if self.latitude >= 0:
            latitude_direction = " N "
        else:
            latitude_direction = " S "


        if self.longitude >= 0:
            longitude_direction = " E"
        else:
            longitude_direction = " W"

        return str(self.latitude/1000000) + latitude_direction + str(self.longitude/1000000) + longitude_direction


class Data(models.Model):
    created = models.DateTimeField(auto_now=True)
    aqi = models.DecimalField(max_digits=5, decimal_places=2)
    ldr = models.IntegerField()
    hits = models.PositiveSmallIntegerField()
    road = models.ForeignKey(Road, on_delete=models.CASCADE)
