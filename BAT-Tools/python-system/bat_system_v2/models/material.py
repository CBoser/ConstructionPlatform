"""
Material data models
Maps to materials table in database
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MaterialBase(BaseModel):
    """Base material model with common fields"""
    sku: str = Field(..., max_length=50, description="Material SKU (Excel Column F)")
    description: str = Field(..., description="Material description (Excel Column B)")
    online_description: Optional[str] = Field(None, description="Online description (Excel Column K)")
    category_id: Optional[int] = Field(None, description="Category reference")
    uom: Optional[str] = Field(None, max_length=20, description="Unit of measure (Excel Column L)")
    format1: Optional[str] = Field(None, max_length=20, description="Format 1 (Excel Column D)")
    format2: Optional[str] = Field(None, max_length=20, description="Format 2 (Excel Column E)")
    is_active: bool = Field(True, description="Active status")


class MaterialCreate(MaterialBase):
    """Model for creating new materials"""
    pass


class MaterialUpdate(BaseModel):
    """Model for updating existing materials (all fields optional)"""
    sku: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    online_description: Optional[str] = None
    category_id: Optional[int] = None
    uom: Optional[str] = Field(None, max_length=20)
    format1: Optional[str] = Field(None, max_length=20)
    format2: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class Material(MaterialBase):
    """Material model for API responses"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaterialInDB(Material):
    """Material model as stored in database (includes all fields)"""
    pass


class MaterialSearch(BaseModel):
    """Model for material search parameters"""
    query: Optional[str] = Field(None, description="Search query (SKU or description)")
    category_id: Optional[int] = Field(None, description="Filter by category")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    sku_contains: Optional[str] = Field(None, description="SKU contains text")
    description_contains: Optional[str] = Field(None, description="Description contains text")
    limit: int = Field(100, ge=1, le=1000, description="Result limit")
    offset: int = Field(0, ge=0, description="Result offset")


class MaterialWithPricing(Material):
    """Material with current pricing information"""
    current_cost: Optional[float] = None
    current_price_01: Optional[float] = None
    current_price_02: Optional[float] = None
    current_price_03: Optional[float] = None
    current_price_l5: Optional[float] = None
    supplier_name: Optional[str] = None
