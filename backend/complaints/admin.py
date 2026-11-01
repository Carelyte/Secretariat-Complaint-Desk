from django.contrib import admin

from .models import Comment, Complaint, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    search_fields = ["name"]


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ["title", "department", "status", "is_anonymous", "created_at"]
    list_filter = ["status", "department", "is_anonymous"]
    search_fields = ["title", "details"]
    inlines = [CommentInline]
