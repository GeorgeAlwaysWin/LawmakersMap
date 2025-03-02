from django.shortcuts import render

# Create your views here.
def map_yandex(request):
    return render(request, "index.html")