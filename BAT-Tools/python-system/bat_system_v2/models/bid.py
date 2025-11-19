"""
Bid data models
Maps to bids, bid_items, and bid_revisions tables
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BidBase(BaseModel):
    """Base bid model"""
    bid_number: str = Field(..., max_length=50, description="Unique bid number")
    customer_id: Optional[UUID] = Field(None, description="Customer reference")
    plan_id: Optional[UUID] = Field(None, description="Plan reference")
    status: str = Field("draft", max_length=20, description="Bid status (draft, pending, approved, rejected)")
    created_date: date = Field(..., description="Bid creation date")
    valid_until: Optional[date] = Field(None, description="Bid expiration date")
    notes: Optional[str] = Field(None, description="Bid notes")


class BidCreate(BidBase):
    """Model for creating new bids"""
    pass


class BidUpdate(BaseModel):
    """Model for updating bids"""
    status: Optional[str] = Field(None, max_length=20)
    valid_until: Optional[date] = None
    notes: Optional[str] = None


class Bid(BidBase):
    """Bid model for API responses"""
    id: UUID
    total_cost: Optional[Decimal] = Field(None, description="Sum of TTL COST (Excel Column P)")
    total_sell: Optional[Decimal] = Field(None, description="Sum of TTL SELL (Excel Column M)")
    margin_dollars: Optional[Decimal] = Field(None, description="MARGIN$ (Excel Column Q)")
    margin_percent: Optional[Decimal] = Field(None, description="MARGIN% (Excel Column R)")
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BidItemBase(BaseModel):
    """Base bid item model"""
    bid_id: UUID = Field(..., description="Bid reference")
    material_id: Optional[UUID] = Field(None, description="Material reference")
    pack_code: Optional[str] = Field(None, max_length=50, description="Pack code")
    quantity: Optional[Decimal] = Field(None, description="Quantity (Excel Column G: QTY)")
    unit_cost: Optional[Decimal] = Field(None, description="Unit cost (Excel Column V: COST/EA)")
    unit_sell: Optional[Decimal] = Field(None, description="Unit sell (Excel Column H: PRICE)")
    is_optional: bool = Field(False, description="Optional item flag")
    line_number: Optional[int] = Field(None, description="Line number in bid")


class BidItemCreate(BidItemBase):
    """Model for creating bid items"""
    pass


class BidItem(BidItemBase):
    """Bid item model for API responses"""
    id: UUID
    line_total_cost: Optional[Decimal] = Field(None, description="TTL COST (Excel Column P)")
    line_total_sell: Optional[Decimal] = Field(None, description="TTL SELL (Excel Column M)")
    created_at: datetime

    class Config:
        from_attributes = True


class BidItemWithDetails(BidItem):
    """Bid item with material details"""
    sku: Optional[str] = None
    description: Optional[str] = None
    uom: Optional[str] = None


class BidRevisionBase(BaseModel):
    """Base bid revision model"""
    bid_id: UUID = Field(..., description="Bid reference")
    revision_number: int = Field(..., description="Revision number")
    revised_date: date = Field(..., description="Revision date")
    revision_reason: Optional[str] = Field(None, description="Reason for revision")
    price_delta: Optional[Decimal] = Field(None, description="Price change from previous revision")
    revised_by: Optional[str] = Field(None, max_length=100, description="User who made revision")
    bid_snapshot: Optional[dict] = Field(None, description="Snapshot of bid at this revision")


class BidRevisionCreate(BidRevisionBase):
    """Model for creating bid revisions"""
    pass


class BidRevision(BidRevisionBase):
    """Bid revision model for API responses"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class BidSummary(BaseModel):
    """Bid summary with category breakdowns"""
    bid_id: UUID
    bid_number: str
    customer_name: Optional[str]
    plan_code: Optional[str]
    status: str
    total_cost: Decimal
    total_sell: Decimal
    margin_dollars: Decimal
    margin_percent: Decimal
    item_count: int
    category_breakdowns: list[dict]  # List of category totals


class BidGenerateRequest(BaseModel):
    """Request model for generating bids from plans"""
    customer_id: UUID = Field(..., description="Customer ID")
    plan_code: str = Field(..., description="Plan code")
    pack_codes: list[str] = Field(..., description="Pack codes to include")
    price_level_code: str = Field(..., description="Price level (01, 02, 03, L5)")
    include_optional: bool = Field(False, description="Include optional items")
    valid_days: int = Field(30, description="Bid valid for X days")
    notes: Optional[str] = Field(None, description="Bid notes")
