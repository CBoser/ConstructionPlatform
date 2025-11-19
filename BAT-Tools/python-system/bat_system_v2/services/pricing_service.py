"""
Pricing Engine Service
Replaces Excel pricing formulas with database-driven calculations

Excel formulas replaced:
- Column H (PRICE): Nested IF statements with VLOOKUP
- Column M (TTL SELL): =T12*G12
- Column P (TTL COST): =V12*G12
- Column Q (MARGIN$): =M12-P12
- Column R (MARGIN%): =1-(P12/M12)
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from ..database.base import Base
from ..models.pricing import (
    PriceCalculationRequest,
    PriceCalculationResponse,
)


# SQLAlchemy ORM Models
from sqlalchemy import Column, Date, Integer, Numeric, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
import uuid


class PriceLevelORM(Base):
    """Price Level ORM model"""

    __tablename__ = "price_levels"

    id = Column(Integer, primary_key=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(100))
    markup_percentage = Column(Numeric(5, 2))
    is_active = Column(Integer, default=1)


class MaterialPricingORM(Base):
    """Material Pricing ORM model"""

    __tablename__ = "material_pricing"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    material_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    supplier_id = Column(PG_UUID(as_uuid=True))
    cost_per_uom = Column(Numeric(10, 4), nullable=False)
    uom_cost = Column(String(20))
    conversion_factor = Column(Numeric(10, 4))
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date)
    created_at = Column(TIMESTAMP, server_default=func.now())


class CustomerPricingORM(Base):
    """Customer-specific Pricing ORM model"""

    __tablename__ = "customer_pricing"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(PG_UUID(as_uuid=True), nullable=False)
    material_id = Column(PG_UUID(as_uuid=True), nullable=False)
    price_level_id = Column(Integer)
    custom_price = Column(Numeric(10, 4))
    sell_each = Column(Numeric(10, 4))
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date)


class PricingService:
    """
    Pricing Engine Service

    Replaces Excel pricing formulas:

    Excel Column H (PRICE):
        =IF(G12="",0,
          IF(S12="01",VLOOKUP(F12,PD,17,0),
            IF(S12="02",VLOOKUP(F12,PD,20,0),
              IF(S12="03",VLOOKUP(F12,PD,23,0),...))))

    Database:
        price = get_price_for_level(material_id, price_level_code)

    Benefits:
    - No nested IFs
    - No hardcoded column numbers
    - Faster lookups (database index)
    - Easy to add new price levels
    """

    @staticmethod
    def get_current_cost(db: Session, material_id: UUID) -> Optional[Decimal]:
        """
        Get current cost for material (Excel Column V: COST/EA)

        Replaces: Excel VLOOKUP to get cost

        Args:
            db: Database session
            material_id: Material UUID

        Returns:
            Current cost per UOM or None
        """
        pricing = (
            db.query(MaterialPricingORM)
            .filter(
                and_(
                    MaterialPricingORM.material_id == material_id,
                    MaterialPricingORM.effective_date <= date.today(),
                    or_(
                        MaterialPricingORM.expiration_date.is_(None),
                        MaterialPricingORM.expiration_date > date.today(),
                    ),
                )
            )
            .order_by(MaterialPricingORM.effective_date.desc())
            .first()
        )

        return pricing.cost_per_uom if pricing else None

    @staticmethod
    def get_price_for_level(
        db: Session,
        material_id: UUID,
        price_level_code: str,
        customer_id: Optional[UUID] = None,
    ) -> Optional[Decimal]:
        """
        Get price for material at specified price level (Excel Column H: PRICE)

        Replaces Excel nested IF with VLOOKUP:
            =IF(G12="",0,IF(S12="01",VLOOKUP(F12,PD,17,0),IF(S12="02",...)))

        Args:
            db: Database session
            material_id: Material UUID
            price_level_code: Price level (01, 02, 03, L5)
            customer_id: Optional customer ID for custom pricing

        Returns:
            Price or None
        """
        # Check for customer-specific pricing first
        if customer_id:
            custom_pricing = (
                db.query(CustomerPricingORM)
                .filter(
                    and_(
                        CustomerPricingORM.customer_id == customer_id,
                        CustomerPricingORM.material_id == material_id,
                        CustomerPricingORM.effective_date <= date.today(),
                        or_(
                            CustomerPricingORM.expiration_date.is_(None),
                            CustomerPricingORM.expiration_date > date.today(),
                        ),
                    )
                )
                .first()
            )

            if custom_pricing and custom_pricing.custom_price:
                return custom_pricing.custom_price

        # Get standard pricing based on price level
        price_level = (
            db.query(PriceLevelORM)
            .filter(PriceLevelORM.code == price_level_code)
            .first()
        )

        if not price_level:
            return None

        # Get current cost
        cost = PricingService.get_current_cost(db, material_id)
        if not cost:
            return None

        # Apply markup
        if price_level.markup_percentage:
            markup_multiplier = 1 + (price_level.markup_percentage / 100)
            return cost * Decimal(str(markup_multiplier))

        return cost

    @staticmethod
    def calculate_totals(
        quantity: Decimal, unit_cost: Decimal, unit_sell: Decimal
    ) -> Dict[str, Decimal]:
        """
        Calculate pricing totals (Excel Columns M, P, Q, R)

        Replaces Excel formulas:
        - Column M (TTL SELL): =IF(G12="",0,IF(G12=0,"",T12*G12))
        - Column P (TTL COST): =V12*G12
        - Column Q (MARGIN$): =M12-P12
        - Column R (MARGIN%): =1-(P12/M12)  [with division-by-zero protection]

        Args:
            quantity: Quantity (Excel Column G: QTY)
            unit_cost: Cost per unit (Excel Column V: COST/EA)
            unit_sell: Sell price per unit (Excel Column H: PRICE)

        Returns:
            Dictionary with totals and margins
        """
        # Total cost (Column P)
        total_cost = unit_cost * quantity

        # Total sell (Column M)
        total_sell = unit_sell * quantity

        # Margin dollars (Column Q)
        margin_dollars = total_sell - total_cost

        # Margin percent (Column R) - with division-by-zero protection
        if total_sell > 0:
            margin_percent = (Decimal("1") - (total_cost / total_sell)) * Decimal("100")
        else:
            margin_percent = Decimal("0")

        return {
            "total_cost": total_cost,
            "total_sell": total_sell,
            "margin_dollars": margin_dollars,
            "margin_percent": margin_percent,
        }

    @staticmethod
    def calculate_price(
        db: Session, request: PriceCalculationRequest
    ) -> Optional[PriceCalculationResponse]:
        """
        Complete price calculation for a material

        Replaces entire Excel row calculation (Columns G-R)

        Args:
            db: Database session
            request: Calculation request

        Returns:
            Complete pricing calculation
        """
        from .material_service import MaterialService

        # Get material
        material = MaterialService.get_by_id(db, request.material_id)
        if not material:
            return None

        # Get unit cost
        unit_cost = PricingService.get_current_cost(db, request.material_id)
        if not unit_cost:
            return None

        # Get unit sell price
        unit_sell = PricingService.get_price_for_level(
            db,
            request.material_id,
            request.price_level_code,
            request.customer_id,
        )
        if not unit_sell:
            return None

        # Calculate totals
        totals = PricingService.calculate_totals(request.quantity, unit_cost, unit_sell)

        return PriceCalculationResponse(
            material_id=request.material_id,
            sku=material.sku,
            description=material.description,
            quantity=request.quantity,
            unit_cost=unit_cost,
            unit_sell=unit_sell,
            total_cost=totals["total_cost"],
            total_sell=totals["total_sell"],
            margin_dollars=totals["margin_dollars"],
            margin_percent=totals["margin_percent"],
            price_level=request.price_level_code,
        )

    @staticmethod
    def bulk_update_prices(
        db: Session,
        material_ids: List[UUID],
        adjustment_pct: Decimal,
        effective_date: date,
    ) -> int:
        """
        Bulk update prices for multiple materials

        Used for monthly price updates (replaces manual Excel updates)

        Args:
            db: Database session
            material_ids: List of material IDs
            adjustment_pct: Percentage adjustment (e.g., 5.5 for 5.5% increase)
            effective_date: Effective date for new prices

        Returns:
            Number of materials updated
        """
        count = 0
        multiplier = Decimal("1") + (adjustment_pct / Decimal("100"))

        for material_id in material_ids:
            # Get current pricing
            current = (
                db.query(MaterialPricingORM)
                .filter(
                    and_(
                        MaterialPricingORM.material_id == material_id,
                        MaterialPricingORM.effective_date <= date.today(),
                        or_(
                            MaterialPricingORM.expiration_date.is_(None),
                            MaterialPricingORM.expiration_date > date.today(),
                        ),
                    )
                )
                .order_by(MaterialPricingORM.effective_date.desc())
                .first()
            )

            if current:
                # Expire old pricing
                current.expiration_date = effective_date

                # Create new pricing
                new_cost = current.cost_per_uom * multiplier
                new_pricing = MaterialPricingORM(
                    material_id=material_id,
                    supplier_id=current.supplier_id,
                    cost_per_uom=new_cost,
                    uom_cost=current.uom_cost,
                    conversion_factor=current.conversion_factor,
                    effective_date=effective_date,
                )
                db.add(new_pricing)
                count += 1

        db.commit()
        return count

    @staticmethod
    def get_price_levels(db: Session) -> List[PriceLevelORM]:
        """Get all active price levels"""
        return db.query(PriceLevelORM).filter(PriceLevelORM.is_active == 1).all()
