from django.db import models

class User(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    college = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    role = models.CharField(max_length=50, default="participant")
    password_hash = models.CharField(max_length=255)

    @property
    def is_authenticated(self):
        return True

    class Meta:
        db_table = "users"


class AdminEmail(models.Model):
    email = models.EmailField(primary_key=True)

    class Meta:
        db_table = "admin_emails"


class Submission(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    challenge_id = models.CharField(max_length=100)
    prompt = models.TextField()
    user_id = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="evaluated")
    score = models.FloatField(null=True, blank=True)
    submitted_at = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = "submissions"
