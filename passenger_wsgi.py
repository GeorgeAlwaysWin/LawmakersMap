import os, sys
sys.path.insert(0, '/var/www/u3037138/data/www/pobedonostsev.msk.ru/pobedonostsev')
sys.path.insert(1, '/var/www/u3037138/data/djangoenv/lib/python3.9/site-packages')
os.environ['DJANGO_SETTINGS_MODULE'] = 'pobedonostsev.settings'
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()