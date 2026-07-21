from django.urls import path
from api import views

urlpatterns = [
    # Auth
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/me', views.me, name='me'),
    path('auth/logout', views.logout, name='logout'),

    # Challenge
    path('challenge/timer', views.challenge_timer, name='challenge_timer'),
    path('challenge/active', views.active_challenge, name='active_challenge'),

    # Resources
    path('resources', views.list_resources, name='list_resources'),
    path('resources/<str:resource_id>', views.get_resource, name='get_resource'),

    # Submissions
    path('submissions', views.submissions_handler, name='submissions_handler'),
    path('submissions/me', views.list_my_submissions, name='list_my_submissions'),
    path('submissions/<str:submission_id>', views.get_submission, name='get_submission'),

    # Leaderboard
    path('leaderboard', views.get_leaderboard, name='get_leaderboard'),

    # Admin
    path('admin/stats', views.admin_stats, name='admin_stats'),
    path('admin/submissions/recent', views.admin_submissions_recent, name='admin_submissions_recent'),
    path('admin/submissions', views.admin_submissions, name='admin_submissions'),
    path('admin/participants', views.admin_participants, name='admin_participants'),
    path('admin/challenges', views.admin_challenges, name='admin_challenges'),
    path('admin/resources', views.admin_resources, name='admin_resources'),
]
