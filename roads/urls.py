from django.urls import path, re_path
from . import views

urlpatterns = [
    path('api/save-data/', views.SaveData.as_view(), name="save-data"),
    path('api/new-road/', views.NewRoad.as_view(), name="new-road")
]
