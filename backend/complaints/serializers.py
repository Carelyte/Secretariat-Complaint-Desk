from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Comment, Complaint, Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "author_name", "text", "is_admin", "created_at"]
        read_only_fields = ["id", "is_admin", "created_at"]


class PublicCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["author_name", "text", "is_admin"]
        extra_kwargs = {
            "author_name": {"required": False, "allow_blank": True, "max_length": 100},
            "text": {"max_length": 2000},
            "is_admin": {"required": False, "write_only": True},
        }

    def create(self, validated_data):
        validated_data.pop("is_admin", None)
        return Comment.objects.create(
            complaint=self.context["complaint"],
            is_admin=False,
            **validated_data,
        )


class ComplaintSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "title",
            "details",
            "department",
            "department_name",
            "submitted_by_name",
            "submitter_department",
            "is_anonymous",
            "status",
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "comments"]
        extra_kwargs = {
            "submitted_by_name": {"required": False, "allow_blank": True, "max_length": 100},
            "submitter_department": {"required": False, "allow_blank": True, "max_length": 100},
            "title": {"max_length": 200},
            "details": {"max_length": 5000},
        }

    def get_submitted_by_name(self, obj):
        if obj.is_anonymous:
            return ""
        return obj.submitted_by_name

    def create(self, validated_data):
        validated_data.pop("status", None)
        return Complaint.objects.create(status=Complaint.Status.OPEN, **validated_data)


class AdminComplaintSerializer(ComplaintSerializer):
    submitted_by_name = serializers.CharField(read_only=True)


class ComplaintStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ["status"]

    def validate(self, attrs):
        if "status" not in attrs:
            raise serializers.ValidationError({"status": "This field is required."})
        unexpected_fields = set(self.initial_data) - {"status"}
        if unexpected_fields:
            raise serializers.ValidationError(
                {"non_field_errors": ["Only the status field can be changed."]}
            )
        return attrs


class AdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["author_name", "text"]
        extra_kwargs = {
            "author_name": {"required": False, "allow_blank": True, "max_length": 100},
            "text": {"max_length": 2000},
        }

    def create(self, validated_data):
        return Comment.objects.create(
            complaint=self.context["complaint"],
            is_admin=True,
            **validated_data,
        )


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise AuthenticationFailed("Admin access is required.")
        return data
