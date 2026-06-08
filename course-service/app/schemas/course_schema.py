from datetime import datetime

from pydantic import BaseModel, Field, field_validator


# ─── Request Schemas ──────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    """
    Schema untuk request POST /courses.
    Semua field wajib diisi saat membuat course baru.
    """

    course_code: str = Field(
        ...,
        min_length=2,
        max_length=20,
        examples=["SI301"],
        description="Kode unik mata kuliah",
    )
    course_name: str = Field(
        ...,
        min_length=3,
        max_length=150,
        examples=["Basis Data"],
        description="Nama lengkap mata kuliah",
    )
    credits: int = Field(
        ...,
        ge=1,
        le=6,
        examples=[3],
        description="Jumlah SKS (1–6)",
    )
    semester: int = Field(
        ...,
        ge=1,
        le=8,
        examples=[3],
        description="Semester rekomendasi pengambilan (1–8)",
    )

    @field_validator("course_code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        """Paksa uppercase dan hapus spasi. 'si301' → 'SI301'."""
        return v.strip().upper()

    @field_validator("course_name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip()


class CourseUpdate(BaseModel):
    """
    Schema untuk request PATCH /courses/{id}.

    Semua field OPSIONAL karena PATCH hanya mengubah
    field yang dikirim, tidak mengganti seluruh resource.
    Field yang tidak dikirim tidak akan berubah di database.
    """

    course_name: str | None = Field(
        default=None,
        min_length=3,
        max_length=150,
        description="Nama lengkap mata kuliah (opsional)",
    )
    credits: int | None = Field(
        default=None,
        ge=1,
        le=6,
        description="Jumlah SKS (opsional)",
    )
    semester: int | None = Field(
        default=None,
        ge=1,
        le=8,
        description="Semester rekomendasi (opsional)",
    )
    is_active: bool | None = Field(
        default=None,
        description="Status aktif course (opsional)",
    )

    @field_validator("course_name")
    @classmethod
    def normalize_name(cls, v: str | None) -> str | None:
        return v.strip() if v else v


# ─── Response Schemas ─────────────────────────────────────────────────────────

class CourseResponse(BaseModel):
    """
    Schema untuk data course yang dikembalikan ke klien.

    from_attributes=True memungkinkan Pydantic membaca data
    langsung dari SQLAlchemy ORM object (bukan hanya dict).
    """

    id: int
    course_code: str
    course_name: str
    credits: int
    semester: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseListResponse(BaseModel):
    """
    Schema untuk response daftar course dengan info pagination.

    Pagination metadata membantu frontend menampilkan
    navigasi halaman tanpa request tambahan.
    """

    items: list[CourseResponse]
    total: int     # Total seluruh record yang cocok
    page: int      # Halaman saat ini
    size: int      # Jumlah item per halaman
    pages: int     # Total halaman


class APIResponse(BaseModel):
    """
    Response envelope standar untuk semua endpoint.

    Memastikan semua response punya struktur yang konsisten
    sehingga Enrollment Service, Student Service, dll.
    bisa mem-parse response dengan cara yang sama.

    Sukses:  { "success": true,  "message": "...", "data": {...} }
    Gagal:   { "success": false, "message": "...", "data": null  }
    """

    success: bool
    message: str
    data: CourseResponse | CourseListResponse | None = None