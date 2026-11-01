from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Complaint(models.Model):
    class Status(models.TextChoices):
        OPEN = "Open", "Open"
        IN_REVIEW = "In Review", "In Review"
        RESOLVED = "Resolved", "Resolved"

    title = models.CharField(max_length=200)
    details = models.TextField(max_length=5000)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="complaints")
    submitted_by_name = models.CharField(max_length=100, blank=True)
    submitter_department = models.CharField(max_length=100, blank=True)
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Comment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="comments")
    author_name = models.CharField(max_length=100, blank=True)
    text = models.TextField(max_length=2000)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment on {self.complaint_id}"
