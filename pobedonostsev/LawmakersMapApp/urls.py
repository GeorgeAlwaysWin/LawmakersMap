from django.urls import path
from . import views

# URLcon
urlpatterns = [
    path('', views.map_yandex),
]
