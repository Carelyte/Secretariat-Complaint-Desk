from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Complaint, Department


class ComplaintAPITests(APITestCase):
    def setUp(self):
        self.department = Department.objects.get(name="Administration")
        self.complaint = Complaint.objects.create(
            title="Anonymous issue",
            details="A test complaint",
            department=self.department,
            submitted_by_name="Confidential Person",
            is_anonymous=True,
        )
        self.admin = get_user_model().objects.create_user(
            username="secretariat-admin",
            password="test-password-123",
            is_staff=True,
        )

    def test_public_can_create_complaint_status_is_forced_open(self):
        response = self.client.post(
            "/api/complaints/",
            {
                "title": "New issue",
                "details": "Details",
                "department": self.department.id,
                "status": "Resolved",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], Complaint.Status.OPEN)

    def test_public_cannot_delete_complaint(self):
        response = self.client.delete(f"/api/complaints/{self.complaint.id}/")
        self.assertIn(response.status_code, [401, 403, 405])
        self.assertTrue(Complaint.objects.filter(pk=self.complaint.pk).exists())

    def test_admin_can_delete_complaint(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f"/api/admin/complaints/{self.complaint.id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Complaint.objects.filter(pk=self.complaint.pk).exists())

    def test_public_list_hides_anonymous_name_and_admin_list_shows_it(self):
        public_response = self.client.get("/api/complaints/")
        self.assertEqual(public_response.data[0]["submitted_by_name"], "")

        self.client.force_authenticate(user=self.admin)
        admin_response = self.client.get("/api/admin/complaints/")
        self.assertEqual(admin_response.data[0]["submitted_by_name"], "Confidential Person")

    def test_public_comment_cannot_set_admin_flag(self):
        response = self.client.post(
            f"/api/complaints/{self.complaint.id}/comments/",
            {"text": "Staff comment", "is_admin": True},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["is_admin"])

    def test_admin_endpoints_require_staff_authentication(self):
        response = self.client.get("/api/admin/stats/")
        self.assertIn(response.status_code, [401, 403])

    def test_non_staff_user_cannot_obtain_admin_jwt(self):
        user = get_user_model().objects.create_user(
            username="ordinary-user",
            password="test-password-123",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": "test-password-123"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_public_detail_hides_anonymous_name(self):
        response = self.client.get(f"/api/complaints/{self.complaint.id}/")
        self.assertEqual(response.data["submitted_by_name"], "")

    def test_admin_can_update_status_only(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/complaints/{self.complaint.id}/",
            {"status": "Resolved", "title": "Changed title"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.title, "Anonymous issue")

    def test_admin_complaint_list_supports_department_filter(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/admin/complaints/?department={self.department.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["department_name"], "Administration")

    def test_admin_can_export_all_complaint_data_as_csv(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/admin/complaints/export/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv; charset=utf-8")
        self.assertIn("attachment; filename=", response["Content-Disposition"])
        self.assertIn("Confidential Person", response.content.decode("utf-8-sig"))

    def test_public_cannot_export_complaints(self):
        response = self.client.get("/api/admin/complaints/export/")
        self.assertIn(response.status_code, [401, 403])
