from rest_framework import serializers
from .models import *


class DataSerializer(serializers.ModelSerializer):

    class Meta:
        model = Data
        fields = ('aqi','ldr','hits')


class RoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Road
        fields = ('user', 'lane_count', 'barricade', 'shut_reason')