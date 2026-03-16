# backend/ssbs/settings.py
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # must be called before any os.environ.get()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Vault Integration — secrets from HashiCorp Vault (fallback to env vars)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from ssbs.vault import get_secret

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = get_secret('django', 'secret_key', os.environ.get('SECRET_KEY'))
# Prioritize environment variable for DEBUG during dev
DEBUG_ENV = os.environ.get('APP_DEBUG', os.environ.get('DEBUG', 'False'))
DEBUG = str(DEBUG_ENV).lower() in ['true', '1', 'yes', 't']

ALLOWED_HOSTS_ENV = get_secret('django', 'allowed_hosts', os.environ.get('ALLOWED_HOSTS', '*'))
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_ENV.split(',')] if ALLOWED_HOSTS_ENV != '*' else ['*']

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

AUTH_USER_MODEL = 'users.User'  # required — custom user model

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'apps.users',
    'apps.stations',
    'apps.buses',
    'apps.routes',
    'apps.drivers',
    'apps.trips',
    'apps.reservations',
    'apps.reports',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ssbs.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ssbs.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_secret('database', 'name', os.environ.get('POSTGRES_DB')),
        'USER': get_secret('database', 'user', os.environ.get('POSTGRES_USER')),
        'PASSWORD': get_secret('database', 'password', os.environ.get('POSTGRES_PASSWORD')),
        'HOST': get_secret('database', 'host', os.environ.get('DB_HOST', 'db')),
        'PORT': get_secret('database', 'port', os.environ.get('DB_PORT', '5432')),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

USE_TZ = True
TIME_ZONE = 'Africa/Casablanca'

USE_I18N = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all during dev
CORS_ALLOWED_ORIGINS = [
    'https://localhost:8443',
    'https://127.0.0.1:8443',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'apps.core.exception_handler.api_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────────────────────────────────────
# 42 Intra OAuth — credentials from Vault
# ──────────────────────────────────────────────────────────────────────────────
INTRA_42_CLIENT_ID = get_secret('oauth42', 'client_id', os.environ.get('INTRA_42_CLIENT_ID', ''))
INTRA_42_CLIENT_SECRET = get_secret('oauth42', 'client_secret', os.environ.get('INTRA_42_CLIENT_SECRET', ''))
INTRA_42_REDIRECT_URI = get_secret(
    'oauth42', 'redirect_uri',
    os.environ.get('INTRA_42_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/42/callback/'),
)
ADMIN_42_LOGIN = get_secret('oauth42', 'admin_login', os.environ.get('ADMIN_42_LOGIN', ''))

# ──────────────────────────────────────────────────────────────────────────────
# Security hardening (behind WAF/reverse proxy)
# ──────────────────────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# ──────────────────────────────────────────────────────────────────────────────
# Public API Key
# ──────────────────────────────────────────────────────────────────────────────
SSBS_API_KEY = get_secret('api', 'key', os.environ.get('SSBS_API_KEY', ''))

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
LOG_DIR = '/var/log/ssbs'
os.makedirs(LOG_DIR, exist_ok=True)  # ensure directory exists at startup

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        'standard': {
            'format': '{asctime} [{levelname}] {name}: {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '[{levelname}] {message}',
            'style': '{',
        },
    },

    'handlers': {
        # Keep printing to stdout so `docker compose logs backend` still works
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        # Write to a rotating file — max 10 MB per file, keep 5 backups
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': f'{LOG_DIR}/backend.log',
            'maxBytes': 10 * 1024 * 1024,  # 10 MB
            'backupCount': 5,
            'formatter': 'standard',
            'encoding': 'utf-8',
        },
        # Async Logstash TCP handler for ELK Stack
        'logstash': {
            'level': 'INFO',
            'class': 'logstash_async.handler.AsynchronousLogstashHandler',
            'host': 'logstash',
            'port': 5000,
            'database_path': f'{LOG_DIR}/logstash.db',
            'transport': 'logstash_async.transport.TcpTransport'
        },
    },

    'root': {
        'handlers': ['console', 'file', 'logstash'],
        'level': 'WARNING',  # only warnings+ from third-party libs by default
    },

    'loggers': {
        # All HTTP requests (GET, POST, errors, 500s)
        'django.request': {
            'handlers': ['console', 'file', 'logstash'],
            'level': 'INFO',
            'propagate': False,
        },
        # Security-related events (bad tokens, permission denied)
        'django.security': {
            'handlers': ['file', 'logstash'],
            'level': 'WARNING',
            'propagate': False,
        },
        # Our application code (views, management commands)
        'apps': {
            'handlers': ['console', 'file', 'logstash'],
            'level': 'INFO',
            'propagate': False,
        },
        # Cron command specifically
        'archive_trips': {
            'handlers': ['console', 'file', 'logstash'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
