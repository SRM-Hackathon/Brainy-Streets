from rest_framework import serializers
from .models import *


class DataSerializer(serializers.ModelSerializer):

    class Meta:
        model = Data
        fields = ('aqi', 'ldr', 'hits', 'speed')


class RoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Road
        fields = ('user', 'lane_count', 'barricade', 'shut_reason')


class EmergencyVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyVehicle
        fields = ('latitude', 'longitude', 'destination_latitude', 'destination_longitude')