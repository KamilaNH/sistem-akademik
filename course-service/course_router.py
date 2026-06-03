from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.course_schema import APIResponse, CourseCreate, CourseUpdate
from app.services.course_service import (
    CourseDuplicateError,
    CourseNotFoundError,
    CourseService,
)

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)


# ─── Dependency Helper ────────────────────────────────────────────────────────

def get_service(db: AsyncSession = Depends(get_db)) -> CourseService:
    """
    Factory untuk CourseService.
    FastAPI meng-inject db session secara otomatis,
    lalu meneruskannya ke CourseService.
    """
    return CourseService(db)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=APIResponse,
    summary="Daftar semua mata kuliah",
)
async def list_courses(
    page: int = Query(default=1, ge=1, description="Nomor halaman"),
    size: int = Query(default=20, ge=1, le=100, description="Item per halaman"),
    semester: int | None = Query(default=None, ge=1, le=8, description="Filter semester"),
    service: CourseService = Depends(get_service),
) -> APIResponse:
    """
    Mengambil daftar mata kuliah aktif.
    Mendukung pagination dan filter semester.
    """
    data = await service.get_all_courses(page=page, size=size, semester=semester)
    return APIResponse(
        success=True,
        message="Daftar mata kuliah berhasil diambil",
        data=data,
    )


@router.get(
    "/code/{course_code}",
    response_model=APIResponse,
    summary="Detail mata kuliah berdasarkan kode",
)
async def get_course_by_code(
    course_code: str,
    service: CourseService = Depends(get_service),
) -> APIResponse:
    """
    Endpoint untuk inter-service communication.
    Digunakan oleh Enrollment Service dan Grade Service
    untuk memvalidasi keberadaan course.
    """
    try:
        data = await service.get_course_by_code(course_code)
        return APIResponse(
            success=True,
            message="Data mata kuliah berhasil diambil",
            data=data,
        )
    except CourseNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/{course_id}",
    response_model=APIResponse,
    summary="Detail mata kuliah berdasarkan ID",
)
async def get_course(
    course_id: int,
    service: CourseService = Depends(get_service),
) -> APIResponse:
    try:
        data = await service.get_course_by_id(course_id)
        return APIResponse(
            success=True,
            message="Data mata kuliah berhasil diambil",
            data=data,
        )
    except CourseNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tambah mata kuliah baru",
)
async def create_course(
    payload: CourseCreate,
    service: CourseService = Depends(get_service),
) -> APIResponse:
    try:
        data = await service.create_course(payload)
        return APIResponse(
            success=True,
            message="Mata kuliah berhasil dibuat",
            data=data,
        )
    except CourseDuplicateError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.patch(
    "/{course_id}",
    response_model=APIResponse,
    summary="Update sebagian data mata kuliah",
)
async def update_course(
    course_id: int,
    payload: CourseUpdate,
    service: CourseService = Depends(get_service),
) -> APIResponse:
    """
    PATCH hanya mengubah field yang dikirim.
    Field yang tidak dikirim tidak akan berubah.
    """
    try:
        data = await service.update_course(course_id, payload)
        return APIResponse(
            success=True,
            message="Mata kuliah berhasil diperbarui",
            data=data,
        )
    except CourseNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{course_id}",
    response_model=APIResponse,
    summary="Hapus mata kuliah (soft delete)",
)
async def delete_course(
    course_id: int,
    service: CourseService = Depends(get_service),
) -> APIResponse:
    """
    Soft delete: course tidak benar-benar terhapus dari database.
    is_active diset menjadi False.
    """
    try:
        await service.delete_course(course_id)
        return APIResponse(
            success=True,
            message="Mata kuliah berhasil dihapus",
            data=None,
        )
    except CourseNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))