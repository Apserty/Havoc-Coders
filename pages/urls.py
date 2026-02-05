from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("jobs/", views.jobs, name="jobs"),
    path("post-job/", views.post_job, name="post_job"),
    path("login/", views.login_view, name="login"),
    path("signup/", views.signup, name="signup"),
    path("logout/", views.logout_view, name="logout"), 
    path("profile/", views.profile, name="profile"),
    path("inbox/", views.inbox, name="inbox"),
    path("about/", views.about, name="about"),
    path("faq/", views.faq, name="faq"),
    path("help/", views.help_center, name="help_center"),
    path("contact/", views.contact_support, name="contact_support"),
    path("safety/", views.safety_guidelines, name="safety_guidelines"),
    path("terms/", views.terms, name="terms"),
    path("apply/<int:gig_id>/", views.apply_to_gig, name="apply_to_gig"),
]
