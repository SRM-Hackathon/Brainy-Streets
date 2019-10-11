from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('harp/', views.harp, name="harp"),
    path('data-description/', views.datadetails, name="data-desc"),
    path('api/save-data/', views.SaveData.as_view(), name="save-data"),
    re_path(r'^api/get-data/(?P<latitude>\d+\.\d+)/(?P<longitude>\d+\.\d+)/$', views.GetData.as_view(), name="get-data"),
    re_path(r'^api/get-geojson/(?P<latitude>\d+\.\d+)/(?P<longitude>\d+\.\d+)/$', views.GetGeoJson.as_view(), name="get-geojson"),
    path('api/new-road/', views.NewRoad.as_view(), name="new-road")
]
