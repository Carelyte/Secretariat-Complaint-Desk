# Ojo Local Government Secretariat Complaint Desk

A local-government complaint management system with a Django REST Framework API and a React/Vite interface. Staff can submit complaints and follow public conversations without creating accounts. Only staff-privileged Django admin users can sign in to the admin workspace.

## Requirements

- Python 3.10 or later
- Node.js 20.19+ or 22.12+
- npm

## Backend setup

### Windows (PowerShell)

```powershell
cd "C:\path\to\Secretariat Complaint Desk\backend"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### macOS (Terminal)

```bash
cd "/path/to/Secretariat Complaint Desk/backend"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000`. The initial database migration creates the ten required departments. `createsuperuser` makes the only kind of account supported by the admin login; there is no public signup.

Edit `backend/.env` before deployment. Set a long, unique `SECRET_KEY`, set `DEBUG=False`, and provide comma-separated production `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`. Never use the development secret in production.

## Frontend setup

Open a second terminal.

### Windows (PowerShell)

```powershell
cd "C:\path\to\Secretariat Complaint Desk\frontend"
npm install
Copy-Item .env.example .env
npm run dev
```

### macOS (Terminal)

```bash
cd "/path/to/Secretariat Complaint Desk/frontend"
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). `VITE_API_URL` in `frontend/.env` can point the interface at a different API URL. For a production frontend bundle, run `npm run build`.

Staff can browse public complaints and their status updates at `http://localhost:5173/complaints`. Use the landing page's **View complaints** link to open this page; filter complaints by Open, In Review, or Resolved.

## Tests

With the backend virtual environment activated:

```bash
python manage.py test complaints
```

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/departments/` | Public |
| GET, POST | `/api/complaints/` | Public |
| GET | `/api/complaints/<id>/` | Public |
| POST | `/api/complaints/<id>/comments/` | Public, throttled |
| POST | `/api/auth/login/` | Admin username and password |
| POST | `/api/auth/refresh/` | Refresh token |
| GET | `/api/admin/complaints/` | Admin JWT |
| GET | `/api/admin/complaints/export/` | Admin JWT; exports CSV |
| PATCH, DELETE | `/api/admin/complaints/<id>/` | Admin JWT |
| POST | `/api/complaints/<id>/admin-reply/` | Admin JWT |
| GET | `/api/admin/stats/` | Admin JWT |

Public complaint creation is also throttled. Anonymous submitter names are only included in admin complaint data. Admin access is enforced by the API in addition to the protected frontend route.

## PostgreSQL

SQLite is configured by default. To switch later, install a PostgreSQL Django driver such as `psycopg`, then change `DATABASES["default"]` in `backend/complaints_project/settings.py` to use `django.db.backends.postgresql` and environment-provided database credentials. The Django models and migrations do not rely on SQLite-specific features.
