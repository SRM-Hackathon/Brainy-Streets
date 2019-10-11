from rest_framework import serializers
from .models import *


class DataSerializer(serializers.ModelSerializer):

    class Meta:
        model = Data
        fields = ('aqi','ldr','hits')


class RoadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Road
        fields = ('username', 'lane_count', 'two_way')