from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings, SettingsConfigDict


# ─── Settings ────────────────────────────────────────────────────────────────

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "course-service"
    app_env: str = "development"
    app_debug: bool = False

    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "course_db"
    db_user: str = "root"
    db_password: str = ""

    @property
    def database_url(self) -> str:
        """
        URL koneksi async untuk SQLAlchemy.
        aiomysql = driver MySQL yang support async/await.
        """
        return (
            f"mysql+aiomysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def database_url_sync(self) -> str:
        """URL sync — digunakan khusus oleh Alembic untuk migrations."""
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()


# ─── Engine ──────────────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,   # Tampilkan SQL query di console saat debug=True
    pool_pre_ping=True,        # Test koneksi sebelum dipakai (cegah stale connection)
    pool_recycle=3600,         # Recycle koneksi setiap 1 jam
)

AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,    # Penting untuk async: hindari lazy load setelah commit
)


# ─── Base Model ──────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """
    Semua SQLAlchemy ORM model harus inherit dari class ini.
    """
    pass


# ─── Dependency ──────────────────────────────────────────────────────────────

async def get_db() -> AsyncSession:
    """
    FastAPI dependency untuk mendapatkan database session.

    Dipakai di router dengan: db: AsyncSession = Depends(get_db)

    Session otomatis di-commit jika tidak ada error,
    di-rollback jika terjadi exception, dan selalu di-close setelahnya.
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()