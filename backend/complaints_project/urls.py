from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from complaints.views import AdminTokenObtainPairView

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/auth/login/", AdminTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("complaints.urls")),
]
