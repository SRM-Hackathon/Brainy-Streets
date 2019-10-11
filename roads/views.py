from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Road, Sensor, Data, Authority, EmergencyVehicle
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.models import User

from rest_framework.authtoken.models import Token
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication

import datetime
import json

from .serializers import *

class SaveData(generics.GenericAPIView):
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        try:
            form_data = (request.body.decode()).split('Token')
            num = 0
            numbers = []
            for char in form_data[0]+'$':
                if char.isdigit():
                    num = num * 10 + int(char)
                else:
                    numbers.append(num)
                    num = 0

            Data.objects.create(
                aqi=numbers[0]/100,
                ldr=numbers[1],
                hits=numbers[2],
                road=Token.objects.get(key=form_data[1]).user,
            )

            return JsonResponse({}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e), 'body': request.body.decode(), 'numbers': numbers, 'token': form_data[1]}, status=status.HTTP_200_OK)


class NewRoad(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        form_data = json.loads(request.body.decode())
        try:
            lane_count = form_data['lane_count']
            sensors = form_data['sensors']
        except:
            lane_count = None
            sensors = []

        try:
            username = form_data['username']
            password = form_data['password']

            for sensor in sensors:
                if Sensor.objects.filter(latitude=sensor['latitude'],longitude=sensor['longitude']).exists():
                    raise Exception("Sensor already exists")

            user = User.objects.create(
                username=username,
                password=password,
                first_name=' '.join(username.split(' ')[:-1]),
                last_name=username.split(' ')[-1]
            )

            user.set_password(password)
            user.save()

            road = Road.objects.create(
                user=user,
                lane_count=lane_count,
            )

            login(request, user)

            for sensor in sensors:
                Sensor.objects.create(
                latitude=int(float(sensor['latitude'])*1000000),
                longitude=int(float(sensor['longitude'])*1000000),
                road=road
                )

            token, _ = Token.objects.get_or_create(user=user)

            response_data = {
                'token': token.key,
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            response_data = {'error_message': "Cannot sign you up due to " + str(e)}
            return JsonResponse(response_data, status=status.HTTP_400_BAD_REQUEST)
