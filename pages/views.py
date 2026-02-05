from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .models import Gig, Application
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST

@login_required
@require_POST
def apply_to_gig(request, gig_id):
    gig = get_object_or_404(Gig, id=gig_id)

    obj, created = Application.objects.get_or_create(
        gig=gig,
        worker=request.user,
        defaults={"status": "PENDING"},
    )

    if not created:
        messages.info(request, f"You already applied. Current status: {obj.status}.")
    else:
        messages.success(request, "Applied successfully!")

    return redirect("inbox")


def home(request):
    # show latest gigs on home (optional)
    featured = Gig.objects.order_by("-created_at")[:6]
    return render(request, "index.html", {"featured_gigs": featured})


def jobs(request):
    gigs = Gig.objects.order_by("-created_at")
    return render(request, "jobs.html", {"gigs": gigs})


@login_required
def post_job(request):
    if request.method == "POST":
        title = (request.POST.get("title") or "").strip()
        employer_name = (request.POST.get("employer_name") or "").strip()
        location = (request.POST.get("location") or "").strip()
        pay = (request.POST.get("pay") or "").strip()
        description = (request.POST.get("description") or "").strip()

        if not (title and employer_name and location and pay and description):
            messages.error(request, "Please fill all required fields.")
            return render(request, "post-job.html")

        Gig.objects.create(
            owner=request.user,
            title=title,
            employer_name=employer_name,
            location=location,
            pay=pay,
            duration=(request.POST.get("duration") or "").strip(),
            workers_needed=int(request.POST.get("workers_needed") or 1),
            job_type=(request.POST.get("job_type") or "").strip(),
            skills=(request.POST.get("skills") or "").strip(),
            schedule=(request.POST.get("schedule") or "").strip(),
            contact_info=(request.POST.get("contact_info") or "").strip(),
            description=description,
        )

        messages.success(request, "Job posted successfully!")
        return redirect("jobs")

    return render(request, "post-job.html")


def login_view(request):
    if request.method == "POST":
        email = (request.POST.get("email") or "").strip().lower()
        password = request.POST.get("password") or ""
        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            return redirect("home")

        messages.error(request, "Invalid email or password.")
        return render(request, "login.html")

    return render(request, "login.html")


def signup(request):
    if request.method == "POST":
        name = (request.POST.get("name") or "").strip()
        email = (request.POST.get("email") or "").strip().lower()
        password = request.POST.get("password") or ""
        accept_terms = request.POST.get("accept_terms") == "on"

        if not (name and email and password):
            messages.error(request, "Please fill all required fields.")
            return render(request, "signup.html")

        if not accept_terms:
            messages.error(request, "Please accept the Terms of Service.")
            return render(request, "signup.html")

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email already registered. Please login.")
            return redirect("login")
        confirm = request.POST.get("confirm_password") or ""
        if password != confirm:
            messages.error(request, "Passwords do not match.")
            return render(request, "signup.html")


        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )
        login(request, user)
        return redirect("home")

    return render(request, "signup.html")


def logout_view(request):
    logout(request)
    return redirect("home")


@login_required
def profile(request):
    # later we’ll show posted jobs / applications etc.
    posted = Gig.objects.filter(owner=request.user).order_by("-created_at")[:10]
    return render(request, "profile.html", {"posted_gigs": posted})


@login_required
def inbox(request):
    # Worker side
    my_pending = Application.objects.filter(worker=request.user, status="PENDING").select_related("gig").order_by("-created_at")
    my_accepted = Application.objects.filter(worker=request.user, status="ACCEPTED").select_related("gig").order_by("-created_at")
    my_rejected = Application.objects.filter(worker=request.user, status="REJECTED").select_related("gig").order_by("-created_at")

    # Employer side
    applicants_pending = Application.objects.filter(gig__owner=request.user, status="PENDING").select_related("gig", "worker").order_by("-created_at")
    applicants_accepted = Application.objects.filter(gig__owner=request.user, status="ACCEPTED").select_related("gig", "worker").order_by("-created_at")
    applicants_rejected = Application.objects.filter(gig__owner=request.user, status="REJECTED").select_related("gig", "worker").order_by("-created_at")

    return render(
        request,
        "inbox.html",
        {
            "my_pending": my_pending,
            "my_accepted": my_accepted,
            "my_rejected": my_rejected,
            "applicants_pending": applicants_pending,
            "applicants_accepted": applicants_accepted,
            "applicants_rejected": applicants_rejected,
        },
    )

@login_required
@require_POST
def accept_application(request, app_id):
    app = get_object_or_404(Application, id=app_id)

    # Only the job owner can accept/reject
    if app.gig.owner_id != request.user.id:
        messages.error(request, "Not allowed.")
        return redirect("inbox")

    app.status = "ACCEPTED"
    app.save(update_fields=["status"])
    messages.success(request, "Application accepted.")
    return redirect("inbox")


@login_required
@require_POST
def reject_application(request, app_id):
    app = get_object_or_404(Application, id=app_id)

    if app.gig.owner_id != request.user.id:
        messages.error(request, "Not allowed.")
        return redirect("inbox")

    app.status = "REJECTED"
    app.save(update_fields=["status"])
    messages.success(request, "Application rejected.")
    return redirect("inbox")


def about(request):
    return render(request, "about.html")


def faq(request):
    return render(request, "faq.html")


def help_center(request):
    return render(request, "help-center.html")


def contact_support(request):
    return render(request, "contact-support.html")


def safety_guidelines(request):
    return render(request, "safety-guidelines.html")


def terms(request):
    return render(request, "terms-of-service.html")
