from django_unicorn.components import UnicornView
from django import forms


class MapYandexView(UnicornView):


    def setMarker(self):
        self.call("addMarker")