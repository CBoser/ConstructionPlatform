"""
Material Catalog Service
Replaces Excel VLOOKUP with fast database queries

Key functionality:
- Fast SKU lookup (replaces VLOOKUP)
- Full-text search
- CRUD operations
- Bulk import from Excel
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.base import Base
from ..models.material import (
    Material,
    MaterialCreate,
    MaterialInDB,
    MaterialSearch,
    MaterialUpdate,
    MaterialWithPricing,
)


# SQLAlchemy ORM Model (matching database schema)
from sqlalchemy import Boolean, Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
import uuid


class MaterialORM(Base):
    """Material ORM model matching database schema"""

    __tablename__ = "materials"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    online_description = Column(Text)
    category_id = Column(Integer)
    uom = Column(String(20))
    format1 = Column(String(20))
    format2 = Column(String(20))
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class MaterialService:
    """
    Material Catalog Service

    Replaces Excel VLOOKUP with database queries:
    - Excel: =VLOOKUP(F12,PD,17,0)  [O(n) scan, slow]
    - Database: SELECT * FROM materials WHERE sku = ? [O(1) index lookup, fast]
    """

    @staticmethod
    def get_by_sku(db: Session, sku: str) -> Optional[MaterialORM]:
        """
        Fast SKU lookup - replaces Excel VLOOKUP

        Excel equivalent: =VLOOKUP(sku, PD, column_index, 0)
        Performance: Database index lookup ~100x faster than Excel VLOOKUP

        Args:
            db: Database session
            sku: Material SKU (Excel Column F)

        Returns:
            Material if found, None otherwise
        """
        return db.query(MaterialORM).filter(MaterialORM.sku == sku).first()

    @staticmethod
    def get_by_id(db: Session, material_id: UUID) -> Optional[MaterialORM]:
        """Get material by UUID"""
        return db.query(MaterialORM).filter(MaterialORM.id == material_id).first()

    @staticmethod
    def search(db: Session, search_params: MaterialSearch) -> List[MaterialORM]:
        """
        Advanced material search

        Supports:
        - Full-text search in SKU and description
        - Category filtering
        - Active/inactive filtering
        - Pagination

        Args:
            db: Database session
            search_params: Search parameters

        Returns:
            List of materials matching criteria
        """
        query = db.query(MaterialORM)

        # Apply filters
        if search_params.query:
            # Search in both SKU and description
            search_term = f"%{search_params.query}%"
            query = query.filter(
                or_(
                    MaterialORM.sku.ilike(search_term),
                    MaterialORM.description.ilike(search_term),
                )
            )

        if search_params.sku_contains:
            query = query.filter(MaterialORM.sku.ilike(f"%{search_params.sku_contains}%"))

        if search_params.description_contains:
            query = query.filter(
                MaterialORM.description.ilike(f"%{search_params.description_contains}%")
            )

        if search_params.category_id is not None:
            query = query.filter(MaterialORM.category_id == search_params.category_id)

        if search_params.is_active is not None:
            query = query.filter(MaterialORM.is_active == search_params.is_active)

        # Apply pagination
        query = query.offset(search_params.offset).limit(search_params.limit)

        return query.all()

    @staticmethod
    def get_all(
        db: Session, skip: int = 0, limit: int = 100, active_only: bool = True
    ) -> List[MaterialORM]:
        """
        Get all materials with pagination

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum records to return
            active_only: Filter to active materials only

        Returns:
            List of materials
        """
        query = db.query(MaterialORM)

        if active_only:
            query = query.filter(MaterialORM.is_active == True)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def count(db: Session, active_only: bool = True) -> int:
        """Get total count of materials"""
        query = db.query(MaterialORM)
        if active_only:
            query = query.filter(MaterialORM.is_active == True)
        return query.count()

    @staticmethod
    def create(db: Session, material: MaterialCreate) -> MaterialORM:
        """
        Create new material

        Args:
            db: Database session
            material: Material creation data

        Returns:
            Created material

        Raises:
            IntegrityError: If SKU already exists
        """
        db_material = MaterialORM(**material.model_dump())
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material

    @staticmethod
    def bulk_create(db: Session, materials: List[MaterialCreate]) -> List[MaterialORM]:
        """
        Bulk create materials - optimized for Excel imports

        Used by auto_import_bat.py to import thousands of materials quickly

        Args:
            db: Database session
            materials: List of materials to create

        Returns:
            List of created materials
        """
        db_materials = [MaterialORM(**m.model_dump()) for m in materials]
        db.bulk_save_objects(db_materials)
        db.commit()
        return db_materials

    @staticmethod
    def update(db: Session, material_id: UUID, material: MaterialUpdate) -> Optional[MaterialORM]:
        """
        Update existing material

        Args:
            db: Database session
            material_id: Material UUID
            material: Update data (only non-None fields are updated)

        Returns:
            Updated material if found, None otherwise
        """
        db_material = MaterialService.get_by_id(db, material_id)
        if not db_material:
            return None

        # Update only provided fields
        update_data = material.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_material, field, value)

        db.commit()
        db.refresh(db_material)
        return db_material

    @staticmethod
    def delete(db: Session, material_id: UUID) -> bool:
        """
        Delete material (soft delete by setting is_active=False)

        Args:
            db: Database session
            material_id: Material UUID

        Returns:
            True if deleted, False if not found
        """
        db_material = MaterialService.get_by_id(db, material_id)
        if not db_material:
            return False

        db_material.is_active = False
        db.commit()
        return True

    @staticmethod
    def hard_delete(db: Session, material_id: UUID) -> bool:
        """
        Permanently delete material from database

        Warning: This cannot be undone!

        Args:
            db: Database session
            material_id: Material UUID

        Returns:
            True if deleted, False if not found
        """
        db_material = MaterialService.get_by_id(db, material_id)
        if not db_material:
            return False

        db.delete(db_material)
        db.commit()
        return True

    @staticmethod
    def get_with_pricing(
        db: Session, material_id: UUID, price_level: Optional[str] = None
    ) -> Optional[MaterialWithPricing]:
        """
        Get material with current pricing information

        Combines material data with pricing (replaces multiple Excel VLOOKUP calls)

        Args:
            db: Database session
            material_id: Material UUID
            price_level: Price level code (01, 02, 03, L5)

        Returns:
            Material with pricing data
        """
        # TODO: Implement join with pricing tables
        # This will replace Excel's nested VLOOKUP formulas
        db_material = MaterialService.get_by_id(db, material_id)
        if not db_material:
            return None

        # Convert to MaterialWithPricing
        # In full implementation, would join material_pricing and customer_pricing tables
        return MaterialWithPricing(
            **db_material.__dict__,
            current_cost=None,  # TODO: Get from material_pricing
            current_price_01=None,  # TODO: Calculate based on price level
            current_price_02=None,
            current_price_03=None,
            current_price_l5=None,
            supplier_name=None,  # TODO: Get from suppliers table
        )

    @staticmethod
    def verify_sku_exists(db: Session, sku: str) -> bool:
        """
        Quick check if SKU exists - useful for data validation

        Args:
            db: Database session
            sku: Material SKU to check

        Returns:
            True if exists, False otherwise
        """
        return db.query(MaterialORM).filter(MaterialORM.sku == sku).count() > 0
