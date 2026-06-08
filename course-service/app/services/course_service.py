import math

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course_model import Course
from app.schemas.course_schema import CourseCreate, CourseListResponse, CourseResponse, CourseUpdate


# ─── Custom Exceptions ────────────────────────────────────────────────────────

class CourseNotFoundError(Exception):
    """Raised ketika course tidak ditemukan atau sudah dihapus."""
    def __init__(self, identifier: int | str):
        super().__init__(f"Course '{identifier}' tidak ditemukan.")


class CourseDuplicateError(Exception):
    """Raised ketika course_code sudah digunakan."""
    def __init__(self, course_code: str):
        super().__init__(f"Course dengan kode '{course_code}' sudah ada.")


# ─── Service ──────────────────────────────────────────────────────────────────

class CourseService:
    """
    Business Logic Layer untuk Course Service.

    Layer ini bertugas:
    - Mengorkestrasi query ke database
    - Menerapkan business rules (validasi duplikat, soft delete, dll.)
    - Mengubah ORM object menjadi Pydantic response schema
    - Melempar domain exception yang jelas dan bermakna

    Layer ini TIDAK boleh tahu tentang:
    - HTTP (status code, request/response object)
    - Presentasi data (formatting, rendering)
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Helpers ──────────────────────────────────────────────────────────────

    async def _get_active_course(self, course_id: int) -> Course:
        """
        Ambil course aktif berdasarkan ID.
        Raise CourseNotFoundError jika tidak ada atau sudah di-soft delete.
        """
        result = await self.db.execute(
            select(Course).where(
                Course.id == course_id,
                Course.is_active == True,  # noqa: E712
            )
        )
        course = result.scalar_one_or_none()
        if not course:
            raise CourseNotFoundError(course_id)
        return course

    # ── Public Methods ────────────────────────────────────────────────────────

    async def get_all_courses(
        self,
        page: int = 1,
        size: int = 20,
        semester: int | None = None,
    ) -> CourseListResponse:
        """
        Ambil semua course aktif dengan pagination.

        Pagination penting di production: tanpa pagination,
        GET /courses bisa mengembalikan ribuan row sekaligus
        dan membebani database serta jaringan.
        """
        offset = (page - 1) * size

        # Query dasar: hanya ambil yang aktif
        base_query = select(Course).where(Course.is_active == True)  # noqa: E712

        # Filter semester jika diberikan
        if semester is not None:
            base_query = base_query.where(Course.semester == semester)

        # Hitung total record untuk metadata pagination
        count_result = await self.db.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        # Ambil data halaman yang diminta
        items_result = await self.db.execute(
            base_query.offset(offset).limit(size)
        )
        courses = list(items_result.scalars().all())

        return CourseListResponse(
            items=[CourseResponse.model_validate(c) for c in courses],
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if total > 0 else 0,
        )

    async def get_course_by_id(self, course_id: int) -> CourseResponse:
        """
        Ambil detail satu course berdasarkan ID.

        Raises:
            CourseNotFoundError: jika course tidak ada atau sudah dihapus
        """
        course = await self._get_active_course(course_id)
        return CourseResponse.model_validate(course)

    async def get_course_by_code(self, course_code: str) -> CourseResponse:
        """
        Ambil detail course berdasarkan course_code.

        Endpoint ini dipakai oleh Enrollment Service dan Grade Service
        untuk memvalidasi course sebelum melakukan operasi di service mereka.

        Raises:
            CourseNotFoundError: jika course tidak ditemukan
        """
        result = await self.db.execute(
            select(Course).where(
                Course.course_code == course_code.upper(),
                Course.is_active == True,  # noqa: E712
            )
        )
        course = result.scalar_one_or_none()
        if not course:
            raise CourseNotFoundError(course_code)
        return CourseResponse.model_validate(course)

    async def create_course(self, data: CourseCreate) -> CourseResponse:
        """
        Buat course baru.

        Business rule: course_code harus unik di seluruh sistem.
        Pengecekan dilakukan sebelum insert agar pesan error
        lebih jelas daripada mengandalkan DB unique constraint error.

        Raises:
            CourseDuplicateError: jika course_code sudah digunakan
        """
        # Cek duplikat
        existing = await self.db.execute(
            select(Course).where(Course.course_code == data.course_code)
        )
        if existing.scalar_one_or_none():
            raise CourseDuplicateError(data.course_code)

        # Buat dan simpan course baru
        new_course = Course(
            course_code=data.course_code,
            course_name=data.course_name,
            credits=data.credits,
            semester=data.semester,
        )
        self.db.add(new_course)
        await self.db.flush()           # Kirim SQL ke DB, belum commit
        await self.db.refresh(new_course)  # Ambil nilai server_default (created_at, dll.)

        return CourseResponse.model_validate(new_course)

    async def update_course(
        self, course_id: int, data: CourseUpdate
    ) -> CourseResponse:
        """
        Update partial (PATCH) data course.

        Hanya field yang dikirim oleh klien yang akan diubah.
        model_dump(exclude_unset=True) memastikan field yang
        tidak dikirim tidak ikut diupdate ke nilai None.

        Raises:
            CourseNotFoundError: jika course tidak ditemukan
        """
        course = await self._get_active_course(course_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(course, field, value)

        await self.db.flush()
        await self.db.refresh(course)

        return CourseResponse.model_validate(course)

    async def delete_course(self, course_id: int) -> None:
        """
        Soft delete course (set is_active = False).

        Course tidak benar-benar dihapus dari database agar
        Enrollment Service dan Grade Service yang menyimpan
        referensi course_id tidak mendapat broken reference.

        Raises:
            CourseNotFoundError: jika course tidak ditemukan
        """
        course = await self._get_active_course(course_id)
        course.is_active = False
        await self.db.flush()