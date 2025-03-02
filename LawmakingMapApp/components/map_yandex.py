from django_unicorn.components import UnicornView
from django import forms

class MapYandexForm(forms.Form):
    task = forms.CharField(min_length=2, max_length=20, required=True)

class MapYandexView(UnicornView):
    form_class = MapYandexForm

    task = ""
    tasks = []

    def add(self):
        if self.is_valid():
            self.tasks.append(self.task)
            self.task = ""