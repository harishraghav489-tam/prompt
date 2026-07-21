import jwt
from django.conf import settings as django_settings
from rest_framework import authentication
from rest_framework import exceptions
from api.models import User, AdminEmail

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        payload = None

        # 1. Try decoding with Django SECRET_KEY
        try:
            payload = jwt.decode(token, django_settings.SECRET_KEY, algorithms=['HS256'])
            is_supabase = False
        except jwt.PyJWTError:
            # 2. Fallback to Supabase JWT Secret if available
            supabase_secret = getattr(django_settings, 'SUPABASE_JWT_SECRET', None)
            if supabase_secret:
                try:
                    payload = jwt.decode(token, supabase_secret, algorithms=['HS256'], options={"verify_aud": False})
                    is_supabase = True
                except jwt.PyJWTError as e:
                    raise exceptions.AuthenticationFailed('Invalid or expired token') from e
            else:
                raise exceptions.AuthenticationFailed('Invalid or expired token')

        if not payload:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        # Supabase sub is the user_id
        user_id = payload.get('sub')
        email = payload.get('email')

        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        if email:
            email_lower = email.lower()
            if email_lower == "admin@promptbench.dev":
                pass
            elif not email_lower.endswith("@bitsathy.ac.in"):
                raise exceptions.AuthenticationFailed("Only college emails ending with @bitsathy.ac.in are allowed")

        try:
            # Try to fetch user from DB
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            if is_supabase and email:
                # If logged in via Supabase/Google and user record doesn't exist, create it dynamically
                user_metadata = payload.get('user_metadata', {})
                name = user_metadata.get('full_name') or user_metadata.get('name') or email.split('@')[0]
                
                is_admin = AdminEmail.objects.filter(email__iexact=email).exists()
                role = "admin" if is_admin else "participant"
                
                user = User.objects.create(
                    id=user_id,
                    email=email,
                    name=name,
                    college=user_metadata.get('college', 'Bannari Amman Institute of Technology'),
                    department=user_metadata.get('department', 'AIML'),
                    role=role,
                    password_hash=''  # Google users do not have a password hash
                )
            else:
                # Also try matching by email in case of overlap
                if email:
                    try:
                        user = User.objects.get(email__iexact=email)
                        # Sync ID to match Supabase ID
                        User.objects.filter(email__iexact=email).update(id=user_id)
                        user.id = user_id
                    except User.DoesNotExist:
                        raise exceptions.AuthenticationFailed('User not found')
                else:
                    raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
