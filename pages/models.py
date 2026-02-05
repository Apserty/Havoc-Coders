from django.db import models
from django.contrib.auth.models import User

class Gig(models.Model):
    JOB_TYPE_CHOICES = [
        ("full-time", "Full Time"),
        ("part-time", "Part Time"),
        ("contract", "Contract"),
        ("temporary", "Temporary"),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posted_gigs")
    title = models.CharField(max_length=200)
    employer_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    pay = models.CharField(max_length=100)  # keep as text because UI uses "₹200/day"
    duration = models.CharField(max_length=100, blank=True)
    workers_needed = models.PositiveIntegerField(default=1)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, blank=True)
    skills = models.CharField(max_length=300, blank=True)
    schedule = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    contact_info = models.CharField(max_length=200, blank=True)

    status = models.CharField(max_length=20, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Application(models.Model):
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name="applications")
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("gig", "worker")

    def __str__(self):
        return f"{self.worker.username} -> {self.gig.title}"
