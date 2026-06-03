# Course Service

Master Data Service untuk informasi mata kuliah dalam ekosistem **Sistem Akademik Microservices**.

## Stack

| Komponen | Teknologi |
|---|---|
| Language | Python 3.12 |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async) |
| Database | MySQL 8.0 |
| Validation | Pydantic v2 |
| DB Client | HeidiSQL |
| Container | Docker + Docker Compose |

## Struktur Folder

```
course-service/
├── app/
│   ├── database/
│   │   └── database.py       # Engine, session, Base, get_db dependency
│   ├── models/
│   │   └── course_model.py   # SQLAlchemy ORM model (tabel courses)
│   ├── routers/
│   │   └── course_router.py  # FastAPI endpoints (HTTP layer)
│   ├── schemas/
│   │   └── course_schema.py  # Pydantic request & response schemas
│   ├── services/
│   │   └── course_service.py # Business logic layer
│   └── main.py               # Entry point, middleware, lifespan
├── .env                      # Environment variables (jangan di-commit)
├── requirements.txt
└── README.md
```

## Cara Menjalankan

### 1. Buat virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Konfigurasi database

Edit file `.env` sesuaikan dengan MySQL lokal Anda:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_db
DB_USER=root
DB_PASSWORD=your_password
```

Buat database di HeidiSQL atau MySQL CLI:

```sql
CREATE DATABASE course_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Buat tabel dengan Alembic

```bash
alembic revision --autogenerate -m "create courses table"
alembic upgrade head
```

### 5. Jalankan service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/courses` | Daftar semua mata kuliah (pagination) |
| GET | `/courses/{id}` | Detail course berdasarkan ID |
| GET | `/courses/code/{code}` | Detail course berdasarkan kode (untuk inter-service) |
| POST | `/courses` | Tambah mata kuliah baru |
| PATCH | `/courses/{id}` | Update sebagian data course |
| DELETE | `/courses/{id}` | Soft delete course |
| GET | `/health` | Health check |

Dokumentasi interaktif: `http://localhost:8000/docs`

## Contoh Request

### Tambah mata kuliah

```json
POST /api/v1/courses
{
  "course_code": "SI301",
  "course_name": "Basis Data",
  "credits": 3,
  "semester": 3
}
```

### Response standar

```json
{
  "success": true,
  "message": "Mata kuliah berhasil dibuat",
  "data": {
    "id": 1,
    "course_code": "SI301",
    "course_name": "Basis Data",
    "credits": 3,
    "semester": 3,
    "is_active": true,
    "created_at": "2025-01-01T10:00:00",
    "updated_at": "2025-01-01T10:00:00"
  }
}
```

## Inter-Service Communication

Service lain mengakses Course Service melalui REST API:

```
# Enrollment Service (Spring Boot) memvalidasi course:
GET http://course-service:8000/api/v1/courses/code/SI301

# Grade Service (PHP) mengambil info SKS:
GET http://course-service:8000/api/v1/courses/1
```