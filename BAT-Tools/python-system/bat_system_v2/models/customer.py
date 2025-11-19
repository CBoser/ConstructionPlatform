"""
Customer data models
Maps to customers table in database
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CustomerBase(BaseModel):
    """Base customer model"""
    name: str = Field(..., max_length=200, description="Customer name")
    email: Optional[EmailStr] = Field(None, description="Customer email")
    phone: Optional[str] = Field(None, max_length=50, description="Customer phone")
    default_price_level_id: Optional[int] = Field(None, description="Default price level reference")
    is_active: bool = Field(True, description="Active status")


class CustomerCreate(CustomerBase):
    """Model for creating new customers"""
    pass


class CustomerUpdate(BaseModel):
    """Model for updating customers (all fields optional)"""
    name: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    default_price_level_id: Optional[int] = None
    is_active: Optional[bool] = None


class Customer(CustomerBase):
    """Customer model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerWithPriceLevel(Customer):
    """Customer with price level details"""
    price_level_code: Optional[str] = None
    price_level_name: Optional[str] = None
