import csv

from django.http import HttpResponse
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Comment, Complaint, Department
from .serializers import (
    AdminReplySerializer,
    AdminComplaintSerializer,
    AdminTokenObtainPairSerializer,
    CommentSerializer,
    ComplaintSerializer,
    ComplaintStatusSerializer,
    DepartmentSerializer,
    PublicCommentCreateSerializer,
)


class PublicWriteThrottleMixin:
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_write"


class StaffCommentView(PublicWriteThrottleMixin, APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicCommentCreateSerializer(
            data=request.data,
            context={"complaint": complaint},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]


def filter_complaints(request, queryset):
    department = request.query_params.get("department")
    complaint_status = request.query_params.get("status")
    search = request.query_params.get("search")
    if department:
        if not department.isdigit():
            raise ValidationError({"department": "Provide a department ID."})
        queryset = queryset.filter(department_id=department)
    if complaint_status:
        queryset = queryset.filter(status=complaint_status)
    if search:
        if len(search) > 200:
            raise ValidationError({"search": "Ensure this field has no more than 200 characters."})
        queryset = queryset.filter(Q(title__icontains=search) | Q(details__icontains=search))
    return queryset


class ComplaintListCreateView(PublicWriteThrottleMixin, generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.AllowAny]

    def get_throttles(self):
        if self.request.method == "POST":
            return super().get_throttles()
        return []

    def get_queryset(self):
        queryset = Complaint.objects.select_related("department").prefetch_related("comments")
        return filter_complaints(self.request, queryset)


class ComplaintDetailView(generics.RetrieveAPIView):
    queryset = Complaint.objects.select_related("department").prefetch_related("comments")
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.AllowAny]


class AdminComplaintListView(generics.ListAPIView):
    queryset = Complaint.objects.select_related("department").prefetch_related("comments")
    serializer_class = AdminComplaintSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Complaint.objects.select_related("department").prefetch_related("comments")
        return filter_complaints(self.request, queryset)


class AdminComplaintExportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @staticmethod
    def safe_spreadsheet_cell(value):
        if isinstance(value, str) and value.startswith(("=", "+", "-", "@", "\t", "\r")):
            return f"'{value}"
        return value

    def get(self, request):
        complaints = filter_complaints(
            request,
            Complaint.objects.select_related("department").prefetch_related("comments"),
        )
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        filename = f"ojo-complaints-{timezone.localtime().strftime('%Y%m%d')}.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response.write("\ufeff")

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Title",
                "Details",
                "Department",
                "Submitted by",
                "Submitter department",
                "Anonymous",
                "Status",
                "Created at",
                "Updated at",
                "Comments",
            ]
        )
        for complaint in complaints:
            comments = " | ".join(
                f"{comment.author_name or ('Admin' if comment.is_admin else 'Staff')}: {comment.text}"
                for comment in complaint.comments.all()
            )
            writer.writerow([
                self.safe_spreadsheet_cell(value)
                for value in [
                    complaint.id,
                    complaint.title,
                    complaint.details,
                    complaint.department.name,
                    complaint.submitted_by_name,
                    complaint.submitter_department,
                    "Yes" if complaint.is_anonymous else "No",
                    complaint.status,
                    complaint.created_at.isoformat(),
                    complaint.updated_at.isoformat(),
                    comments,
                ]
            ])
        return response


class AdminComplaintDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        complaint = self.get_complaint(pk)
        serializer = ComplaintStatusSerializer(complaint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminComplaintSerializer(complaint, context={"request": request}).data)

    def delete(self, request, pk):
        complaint = self.get_complaint(pk)
        complaint.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def get_complaint(pk):
        try:
            return Complaint.objects.select_related("department").prefetch_related("comments").get(pk=pk)
        except Complaint.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound()


class AdminReplyView(PublicWriteThrottleMixin, APIView):
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = []

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound()
        serializer = AdminReplySerializer(
            data=request.data,
            context={"complaint": complaint},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_counts = {
            item["status"]: item["count"]
            for item in Complaint.objects.values("status").annotate(count=Count("id"))
        }
        department_counts = (
            Department.objects.annotate(complaint_count=Count("complaints"))
            .order_by("name")
            .values("id", "name", "complaint_count")
        )
        return Response(
            {
                "total": sum(status_counts.values()),
                "by_status": {
                    choice: status_counts.get(choice, 0)
                    for choice, _ in Complaint.Status.choices
                },
                "by_department": list(department_counts),
            }
        )


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"})
