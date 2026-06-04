from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Course(Base):         
    """
    ORM Model untuk tabel 'courses' di MySQL.

    Kolom bisnis:
      - course_code  : kode unik seperti SI301, CS101
      - course_name  : nama lengkap mata kuliah
      - credits      : jumlah SKS (1–6)
      - semester     : semester rekomendasi (1–8)

    Kolom sistem:
      - is_active    : soft delete flag (False = dihapus tapi masih ada di DB)
      - created_at   : diisi otomatis saat insert oleh MySQL server
      - updated_at   : diperbarui otomatis saat update oleh MySQL server

    Kenapa soft delete?
      Service lain (Enrollment, Grade) menyimpan course_id.
      Hard delete akan merusak referensi mereka.
      Soft delete menjaga integritas data antar-service.
    """

    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    course_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        comment="Kode mata kuliah unik, contoh: SI301, CS101",
    )

    course_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        comment="Nama lengkap mata kuliah",
    )

    credits: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="Jumlah SKS, nilai 1 sampai 6",
    )

    semester: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="Semester rekomendasi pengambilan, nilai 1 sampai 8",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        server_default="1",
        comment="False berarti course sudah dihapus (soft delete)",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        comment="Timestamp saat record dibuat",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Timestamp saat record terakhir diubah",
    )

    def __repr__(self) -> str:
        return f"<Course id={self.id} code={self.course_code!r} name={self.course_name!r}>"