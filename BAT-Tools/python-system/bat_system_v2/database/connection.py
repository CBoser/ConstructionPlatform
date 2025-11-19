"""
Database connection management using SQLAlchemy
"""

import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

# Database connection settings
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/bat_system_v2"
)

# Connection pool settings
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    pool_pre_ping=True,  # Verify connections before using
    echo=os.getenv("DB_ECHO", "false").lower() == "true",  # SQL logging
)


# Event listener for connection setup
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Set connection-level settings (PostgreSQL-specific)"""
    # For PostgreSQL, we can set statement_timeout, etc.
    pass


# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # Keep objects accessible after commit
)


def init_db() -> None:
    """
    Initialize the database
    - Creates all tables if they don't exist
    - Should be called on application startup
    """
    from .base import Base

    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")


def close_db() -> None:
    """
    Close database connections
    Should be called on application shutdown
    """
    engine.dispose()
    print("Database connections closed")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Material).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions

    Usage:
        with get_db_context() as db:
            materials = db.query(Material).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def execute_transaction(func, *args, **kwargs):
    """
    Execute a function within a database transaction

    Args:
        func: Function to execute that takes db session as first argument
        *args: Additional positional arguments
        **kwargs: Additional keyword arguments

    Returns:
        Result of the function

    Usage:
        def create_material(db, sku, description):
            material = Material(sku=sku, description=description)
            db.add(material)
            return material

        result = execute_transaction(create_material, "12345", "Test Material")
    """
    with get_db_context() as db:
        return func(db, *args, **kwargs)


class DatabaseHealthCheck:
    """Database health check utilities"""

    @staticmethod
    def check_connection() -> bool:
        """Check if database connection is working"""
        try:
            with get_db_context() as db:
                db.execute("SELECT 1")
            return True
        except Exception as e:
            print(f"Database connection check failed: {e}")
            return False

    @staticmethod
    def get_pool_status() -> dict:
        """Get connection pool status"""
        pool = engine.pool
        return {
            "size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "max_overflow": MAX_OVERFLOW,
            "pool_size": POOL_SIZE,
        }
