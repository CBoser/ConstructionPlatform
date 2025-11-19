"""
Pricing data models
Maps to pricing-related tables in database
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PriceLevelBase(BaseModel):
    """Base price level model"""
    code: str = Field(..., max_length=10, description="Price level code (01, 02, 03, L5)")
    name: Optional[str] = Field(None, max_length=100, description="Price level name")
    markup_percentage: Optional[Decimal] = Field(None, description="Markup percentage")
    is_active: bool = Field(True, description="Active status")


class PriceLevel(PriceLevelBase):
    """Price level model for API responses"""
    id: int

    class Config:
        from_attributes = True


class MaterialPricingBase(BaseModel):
    """Base material pricing model"""
    material_id: UUID = Field(..., description="Material reference")
    supplier_id: Optional[UUID] = Field(None, description="Supplier reference")
    cost_per_uom: Decimal = Field(..., description="Cost per UOM (Excel Column V: COST/EA)")
    uom_cost: Optional[str] = Field(None, max_length=20, description="UOM for cost (Excel Column U)")
    conversion_factor: Optional[Decimal] = Field(None, description="Conversion factor (Excel Column N: CONVER)")
    effective_date: date = Field(..., description="Price effective date")
    expiration_date: Optional[date] = Field(None, description="Price expiration date")


class MaterialPricingCreate(MaterialPricingBase):
    """Model for creating material pricing"""
    pass


class MaterialPricing(MaterialPricingBase):
    """Material pricing model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerPricingBase(BaseModel):
    """Base customer-specific pricing model"""
    customer_id: UUID = Field(..., description="Customer reference")
    material_id: UUID = Field(..., description="Material reference")
    price_level_id: Optional[int] = Field(None, description="Price level reference")
    custom_price: Optional[Decimal] = Field(None, description="Custom price (Excel Column H: PRICE)")
    sell_each: Optional[Decimal] = Field(None, description="Sell price each (Excel Column T: SELL/EA)")
    effective_date: date = Field(..., description="Price effective date")
    expiration_date: Optional[date] = Field(None, description="Price expiration date")


class CustomerPricingCreate(CustomerPricingBase):
    """Model for creating customer pricing"""
    pass


class CustomerPricing(CustomerPricingBase):
    """Customer pricing model for API responses"""
    id: UUID

    class Config:
        from_attributes = True


class PricingUpdateBase(BaseModel):
    """Base pricing update tracking model"""
    update_date: date = Field(..., description="Date of pricing update")
    source: Optional[str] = Field(None, max_length=50, description="Update source (manual, api, supplier_feed)")
    materials_updated: Optional[int] = Field(None, description="Count of materials updated")
    avg_price_change_pct: Optional[Decimal] = Field(None, description="Average price change percentage")
    updated_by: Optional[str] = Field(None, max_length=100, description="User who performed update")
    notes: Optional[str] = Field(None, description="Update notes")


class PricingUpdateCreate(PricingUpdateBase):
    """Model for creating pricing update record"""
    pass


class PricingUpdate(PricingUpdateBase):
    """Pricing update model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class BulkPriceUpdate(BaseModel):
    """Model for bulk price updates"""
    material_ids: list[UUID] = Field(..., description="List of material IDs to update")
    price_adjustment_pct: Optional[Decimal] = Field(None, description="Percentage adjustment (e.g., 5.5 for 5.5% increase)")
    new_prices: Optional[dict[str, Decimal]] = Field(None, description="Map of material_id to new price")
    effective_date: date = Field(..., description="Effective date for new prices")
    notes: Optional[str] = Field(None, description="Update notes")


class PriceCalculationRequest(BaseModel):
    """Request model for price calculations"""
    material_id: UUID = Field(..., description="Material ID")
    price_level_code: str = Field(..., max_length=10, description="Price level code (01, 02, 03, L5)")
    quantity: Decimal = Field(..., gt=0, description="Quantity")
    customer_id: Optional[UUID] = Field(None, description="Customer ID for custom pricing")


class PriceCalculationResponse(BaseModel):
    """Response model for price calculations"""
    material_id: UUID
    sku: str
    description: str
    quantity: Decimal
    unit_cost: Decimal
    unit_sell: Decimal
    total_cost: Decimal
    total_sell: Decimal
    margin_dollars: Decimal
    margin_percent: Decimal
    price_level: str
