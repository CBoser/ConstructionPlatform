"""
Supplier data models
Maps to suppliers table in database
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    """Base supplier model"""
    name: str = Field(..., max_length=200, description="Supplier name")
    contact_email: Optional[EmailStr] = Field(None, description="Supplier contact email")
    is_active: bool = Field(True, description="Active status")


class SupplierCreate(SupplierBase):
    """Model for creating new suppliers"""
    pass


class SupplierUpdate(BaseModel):
    """Model for updating suppliers (all fields optional)"""
    name: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class Supplier(SupplierBase):
    """Supplier model for API responses"""
    id: UUID

    class Config:
        from_attributes = True
