import jwt
from django.conf import settings as django_settings
from rest_framework import authentication
from rest_framework import exceptions
from api.models import User

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            # Note: settings.SECRET_KEY is loaded from settings.py
            payload = jwt.decode(token, django_settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.PyJWTError as e:
            raise exceptions.AuthenticationFailed('Invalid or expired token') from e

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
