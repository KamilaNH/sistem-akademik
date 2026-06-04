import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database.database import engine, settings
from app.models.course_model import Base
from app.routers.course_router import router as course_router

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG if settings.app_debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verifikasi koneksi database & buat tabel
    logger.info("Starting %s [%s]", settings.app_name, settings.app_env)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection: OK")

        # Buat tabel otomatis jika belum ada
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created/verified: OK")

    except Exception as exc:
        logger.critical("Database connection FAILED: %s", exc)
        raise

    yield

    # Shutdown: tutup semua koneksi
    await engine.dispose()
    logger.info("Database connections closed. Service stopped.")


# ─── App Instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Course Service API",
    description=(
        "Master Data Service untuk informasi mata kuliah "
        "dalam ekosistem Sistem Akademik Microservices. "
        "Diakses oleh Enrollment Service, Grade Service, dan Student Service."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handler ─────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Terjadi kesalahan internal. Silakan coba lagi.",
            "data": None,
        },
    )


# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(course_router, prefix="/api/v1")


@app.get("/health", tags=["Health"], summary="Health check")
async def health_check() -> dict:
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.app_env,
        "version": "1.0.0",
    }