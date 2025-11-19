"""
Plan data models
Maps to plans, packs, plan_materials, and plan_options tables
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PlanBase(BaseModel):
    """Base plan model"""
    plan_code: str = Field(..., max_length=50, description="Plan code (1670, 2336-B, G18L, etc.)")
    name: Optional[str] = Field(None, max_length=200, description="Plan name")
    builder: Optional[str] = Field(None, max_length=100, description="Builder name (Holt, Richmond)")
    square_footage: Optional[int] = Field(None, description="Square footage")
    bedrooms: Optional[int] = Field(None, description="Number of bedrooms")
    bathrooms: Optional[Decimal] = Field(None, description="Number of bathrooms")
    description: Optional[str] = Field(None, description="Plan description")
    is_active: bool = Field(True, description="Active status")


class PlanCreate(PlanBase):
    """Model for creating new plans"""
    pass


class Plan(PlanBase):
    """Plan model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PackBase(BaseModel):
    """Base pack model"""
    code: str = Field(..., max_length=50, description="Pack code (10, 20, 05, etc.)")
    name: Optional[str] = Field(None, max_length=200, description="Pack name (FOUNDATION, MAIN WALLS, etc.)")
    elevations: Optional[list[str]] = Field(None, description="List of elevations (A, B, C, D)")
    phase_code: Optional[str] = Field(None, max_length=10, description="Phase code")
    display_order: Optional[int] = Field(None, description="Display order")
    description: Optional[str] = Field(None, description="Pack description")


class PackCreate(PackBase):
    """Model for creating new packs"""
    pass


class Pack(PackBase):
    """Pack model for API responses"""
    id: UUID

    class Config:
        from_attributes = True


class PlanMaterialBase(BaseModel):
    """Base plan material model"""
    plan_id: UUID = Field(..., description="Plan reference")
    pack_id: Optional[UUID] = Field(None, description="Pack reference")
    material_id: UUID = Field(..., description="Material reference")
    quantity: Decimal = Field(..., description="Quantity (Excel Column G: QTY)")
    unified_code: Optional[str] = Field(None, max_length=50, description="Unified code (PPPP-PPP.000-EE-IIII)")
    location_string: Optional[str] = Field(None, max_length=200, description="Location string (Excel Column A)")
    is_optional: bool = Field(False, description="Optional item flag")
    notes: Optional[str] = Field(None, description="Notes/tally (Excel Column C)")


class PlanMaterialCreate(PlanMaterialBase):
    """Model for creating plan materials"""
    pass


class PlanMaterial(PlanMaterialBase):
    """Plan material model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PlanMaterialWithDetails(PlanMaterial):
    """Plan material with material details"""
    sku: str
    description: str
    uom: Optional[str] = None
    current_cost: Optional[Decimal] = None
    current_price: Optional[Decimal] = None


class PlanOptionBase(BaseModel):
    """Base plan option model"""
    plan_id: UUID = Field(..., description="Plan reference")
    option_code: str = Field(..., max_length=50, description="Option code (OPT DEN, REG3, etc.)")
    option_name: Optional[str] = Field(None, max_length=100, description="Option name")
    description: Optional[str] = Field(None, description="Option description")
    material_adjustments: Optional[dict] = Field(None, description="Material adjustments as JSON")


class PlanOptionCreate(PlanOptionBase):
    """Model for creating plan options"""
    pass


class PlanOption(PlanOptionBase):
    """Plan option model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class PlanExtractRequest(BaseModel):
    """Request model for plan extraction by packs"""
    plan_code: str = Field(..., description="Plan code to extract")
    pack_codes: list[str] = Field(..., description="List of pack codes to include (10, 20, etc.)")
    price_level_code: Optional[str] = Field(None, description="Price level for pricing (01, 02, 03, L5)")
    include_optional: bool = Field(False, description="Include optional items")


class PlanExtractResponse(BaseModel):
    """Response model for plan extraction"""
    plan_code: str
    plan_name: Optional[str]
    packs: list[str]
    materials: list[PlanMaterialWithDetails]
    total_cost: Decimal
    total_sell: Decimal
    margin_dollars: Decimal
    margin_percent: Decimal
    material_count: int
