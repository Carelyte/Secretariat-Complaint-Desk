from django.db import migrations, models
import django.db.models.deletion


DEPARTMENTS = [
    "Administration",
    "Finance",
    "Health",
    "Works",
    "Education",
    "Agriculture",
    "Environment",
    "Community Development",
    "Personnel",
    "ICT",
]


def seed_departments(apps, schema_editor):
    Department = apps.get_model("complaints", "Department")
    Department.objects.using(schema_editor.connection.alias).bulk_create(
        [Department(name=name) for name in DEPARTMENTS],
        ignore_conflicts=True,
    )


def remove_seeded_departments(apps, schema_editor):
    Department = apps.get_model("complaints", "Department")
    Department.objects.using(schema_editor.connection.alias).filter(name__in=DEPARTMENTS).delete()


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Department",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Complaint",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("details", models.TextField(max_length=5000)),
                ("submitted_by_name", models.CharField(blank=True, max_length=100)),
                ("submitter_department", models.CharField(blank=True, max_length=100)),
                ("is_anonymous", models.BooleanField(default=False)),
                ("status", models.CharField(choices=[("Open", "Open"), ("In Review", "In Review"), ("Resolved", "Resolved")], default="Open", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("department", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="complaints", to="complaints.department")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("author_name", models.CharField(blank=True, max_length=100)),
                ("text", models.TextField(max_length=2000)),
                ("is_admin", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("complaint", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="complaints.complaint")),
            ],
            options={"ordering": ["created_at"]},
        ),
        migrations.RunPython(seed_departments, remove_seeded_departments),
    ]
