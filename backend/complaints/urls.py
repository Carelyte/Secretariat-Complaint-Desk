from django.urls import path

from .views import (
    AdminComplaintDetailView,
    AdminComplaintExportView,
    AdminComplaintListView,
    AdminReplyView,
    AdminStatsView,
    ComplaintDetailView,
    ComplaintListCreateView,
    DepartmentListView,
    StaffCommentView,
    health_check,
)

urlpatterns = [
    path("health/", health_check, name="health"),
    path("departments/", DepartmentListView.as_view(), name="department-list"),
    path("complaints/", ComplaintListCreateView.as_view(), name="complaint-list-create"),
    path("complaints/<int:pk>/", ComplaintDetailView.as_view(), name="complaint-detail"),
    path("complaints/<int:pk>/comments/", StaffCommentView.as_view(), name="staff-comment"),
    path("complaints/<int:pk>/admin-reply/", AdminReplyView.as_view(), name="admin-reply"),
    path("admin/complaints/", AdminComplaintListView.as_view(), name="admin-complaints"),
    path("admin/complaints/export/", AdminComplaintExportView.as_view(), name="admin-complaint-export"),
    path("admin/complaints/<int:pk>/", AdminComplaintDetailView.as_view(), name="admin-complaint-detail"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]
