# BAT Tool & Platform Integration Strategy
## Long-Term Strategic Plan

**Created:** November 19, 2025
**Version:** 1.0
**Status:** Strategic Planning Document

---

## Executive Summary

This document outlines a comprehensive strategy for integrating the BAT (Builder's All-In Takeoff) tool with the online materials platform. The goal is to create a seamless workflow where material lists generated in BAT can be exported and imported directly into the platform for pricing, ordering, and fulfillment.

### Strategic Vision

**BAT Tool** → Source of truth for material takeoffs and quantities
**Platform** → Pricing engine, order management, and fulfillment
**MindFlow** → Unified interface orchestrating both systems (future)

---

## Current State Analysis

### BAT Tool Capabilities
- Unified code system: `XXXX-XXX.XXX-XX-XXXX`
- 65,000+ material items (Richmond + Holt)
- Code translation between Richmond/Holt legacy systems
- SQLite database with comprehensive schema
- CSV export functionality (partial)

### Platform Capabilities
- RTK Query API with customer-specific endpoints
- Omni Import for material data ingestion
- SKU search and tally calculations
- Quote management and pricing
- Pack-based organization (`|10 FOUNDATION`)

### Critical Gap
**The two systems speak different languages:**
- BAT: `1670-010.000-A-1000` (unified semantic codes)
- Platform: `|10 FOUNDATION` (legacy pack IDs)

---

## Integration Architecture

### Data Flow Model

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   BAT Tool      │     │  Translation    │     │    Platform     │
│                 │     │     Layer       │     │                 │
│ • Material DB   │────▶│ • Code mapping  │────▶│ • Quote API     │
│ • Unified codes │     │ • Format conv.  │     │ • Pricing       │
│ • Quantities    │     │ • Validation    │     │ • Ordering      │
│                 │◀────│                 │◀────│                 │
│ • Price updates │     │ • Reverse map   │     │ • Live pricing  │
│ • SKU changes   │     │ • Delta sync    │     │ • Availability  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### API Integration Points

| Endpoint | Purpose | Direction |
|----------|---------|-----------|
| `POST /servicerequest/{id}/omni-import` | Import material list | BAT → Platform |
| `POST /quote/{id}/lookup/sku` | Validate SKUs exist | BAT → Platform |
| `POST /quote/tally2mix` | Get quantity recommendations | Platform → BAT |
| `POST /quote/{id}/manualrefreshprice` | Get current pricing | Platform → BAT |
| `GET /quote/locations` | Get location/tax data | Platform → BAT |

---

## Phase 1: Export Foundation (Weeks 1-4)

### Objective
Enable BAT to export material lists in the exact format the Platform expects.

### 1.1 Export Format Implementation

**Target Output:** ZIP package containing:
- `{PlanName} Material List.csv`
- `{PlanName} Sales Order.csv`
- `{PlanName}.pdf` (optional report)

**Material List CSV Schema:**
```csv
Sku,Description,Elevation,Option,Pack,Quantity,Price
24DF,2X4-RL STD&BTR DF,A,,|10 FOUNDATION,60,634.83
```

**Column Mappings from Unified Code:**

| CSV Column | BAT Source | Transformation |
|------------|------------|----------------|
| Sku | vendor_sku | Direct (or item_type_code fallback) |
| Description | description | Direct |
| Elevation | elevation_code | A, B, C, D, or empty for ** |
| Option | option codes | Extract from phase_code minor |
| Pack | phase_code + richmond_pack_id | Reverse translate to `\|XX NAME` |
| Quantity | quantity | Direct |
| Price | cost_per_unit | Direct (requires pricing integration) |

### 1.2 Reverse Code Translation

Create mapping from unified codes back to platform format:

```python
def unified_to_platform_pack(phase_code: str, phase_name: str) -> str:
    """
    Convert unified phase code to platform pack format.

    Examples:
        010.000 → |10 FOUNDATION
        010.820 → |10.82 OPT DEN FOUNDATION
        020.600 → |20.6 OPT EXTENDED GREAT ROOM
    """
    major = int(phase_code[:3])
    minor = int(phase_code[4:7])

    if minor == 0:
        return f"|{major} {phase_name.upper()}"
    else:
        minor_decimal = minor / 10  # 820 → 82
        return f"|{major}.{int(minor_decimal)} {phase_name.upper()}"
```

### 1.3 Deliverables

- [ ] `bat_platform_export.py` - Export module
- [ ] `pack_code_reverse_translation.csv` - Reverse mapping table
- [ ] Unit tests for all transformations
- [ ] Sample export packages for validation

### 1.4 Success Criteria

- Export 100% of materials for a single plan (1670)
- ZIP package imports successfully into Platform
- All SKUs resolve correctly
- Quantities and categories match source

---

## Phase 2: API Integration (Weeks 5-8)

### Objective
Establish automated data flow between BAT and Platform.

### 2.1 Authentication Layer

```python
class PlatformAPIClient:
    def __init__(self, base_url: str, customer_number: str, erp_system: str):
        self.base_url = base_url
        self.customer_number = customer_number
        self.erp_system = erp_system
        self.token = None

    def authenticate(self, access_token: str):
        """Set OAuth2 bearer token from OIDC flow."""
        self.token = access_token

    def _get_customer_url(self, endpoint: str) -> str:
        """Build customer-specific API URL."""
        return f"{self.base_url}/plans-projects/customer/{self.customer_number}/{endpoint}?customerErpSystem={self.erp_system}"
```

### 2.2 Import Workflow

```python
async def import_material_list_to_platform(
    client: PlatformAPIClient,
    material_list_path: str,
    quote_id: int,
    service_request_number: int,
    gross_margin: str = "0.25"
) -> dict:
    """
    Full workflow to import BAT export into Platform.

    Steps:
    1. Upload file to DataCore storage
    2. Call Omni Import endpoint
    3. Validate import results
    4. Return summary
    """
    # Step 1: Upload file (requires separate file upload API)
    file_id = await client.upload_file(material_list_path)

    # Step 2: Call Omni Import
    import_request = {
        "quoteId": quote_id,
        "serviceRequestNumber": service_request_number,
        "dataCoreFile": {
            "dataCoreFileId": file_id,
            "entityType": "MaterialList"
        },
        "materialDataImportAction": 1,  # Append
        "grossMargin": gross_margin,
        "minorCategoryId": None,
        "minorCategoryDescription": None,
        "supplier": None
    }

    result = await client.post(
        f"servicerequest/{service_request_number}/omni-import",
        import_request
    )

    return result
```

### 2.3 SKU Validation

Before import, validate all SKUs exist in Platform:

```python
async def validate_skus_for_import(
    client: PlatformAPIClient,
    material_list: List[dict]
) -> dict:
    """
    Pre-validate all SKUs before import.

    Returns:
        {
            "valid": [...],
            "invalid": [...],
            "suggestions": {...}  # Invalid SKU → suggested replacements
        }
    """
    unique_skus = set(m['sku'] for m in material_list)
    results = {"valid": [], "invalid": [], "suggestions": {}}

    for sku in unique_skus:
        search_result = await client.post(
            "quote/19922/lookup/sku",  # Need configurable quote ID
            {"stringToMatch": sku}
        )

        if search_result['skuResult']:
            results['valid'].append(sku)
        else:
            results['invalid'].append(sku)
            # Check description/attribute matches for suggestions
            if search_result['descriptionResult']:
                results['suggestions'][sku] = search_result['descriptionResult']

    return results
```

### 2.4 Deliverables

- [ ] `platform_api_client.py` - API client module
- [ ] `import_workflow.py` - Full import workflow
- [ ] `sku_validator.py` - Pre-import validation
- [ ] Integration tests with Platform sandbox
- [ ] Error handling and retry logic

### 2.5 Success Criteria

- Automated import of full plan (1670) via API
- 100% SKU validation before import
- Graceful error handling for invalid SKUs
- Audit log of all API calls

---

## Phase 3: Pricing Integration (Weeks 9-12)

### Objective
Synchronize pricing data between Platform and BAT.

### 3.1 Price Refresh Workflow

```python
async def refresh_pricing_from_platform(
    client: PlatformAPIClient,
    quote_id: int,
    pricing_as_of_date: str
) -> dict:
    """
    Get current pricing from Platform for a quote.

    Returns pricing data to update BAT database.
    """
    result = await client.post(
        f"quote/{quote_id}/manualrefreshprice",
        {
            "pricingMethodId": 1,  # Manual refresh
            "pricingAsOfDate": pricing_as_of_date,
            "isManualPriceRefreshed": True
        }
    )

    return {
        "quote_id": result['quoteId'],
        "last_refreshed": result['lastRefreshedDate'],
        "grand_total": result['refreshedGrandTotal']
    }
```

### 3.2 BAT Database Price Update

```python
def update_bat_pricing(
    db_connection,
    plan_code: str,
    pricing_data: List[dict]
):
    """
    Update BAT database with pricing from Platform.

    Creates audit trail for price changes.
    """
    cursor = db_connection.cursor()

    for item in pricing_data:
        # Get current price for audit
        cursor.execute("""
            SELECT material_id, cost_per_unit
            FROM materials
            WHERE plan_code = ? AND vendor_sku = ?
        """, (plan_code, item['sku']))

        current = cursor.fetchone()
        if current and current[1] != item['price']:
            # Log to audit trail
            cursor.execute("""
                INSERT INTO audit_trail
                (table_name, record_id, action, old_values, new_values, changed_by, changed_date)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                'materials',
                current[0],
                'UPDATE',
                json.dumps({'cost_per_unit': current[1]}),
                json.dumps({'cost_per_unit': item['price']}),
                'platform_sync'
            ))

            # Update price
            cursor.execute("""
                UPDATE materials
                SET cost_per_unit = ?, last_price_update = datetime('now')
                WHERE material_id = ?
            """, (item['price'], current[0]))

    db_connection.commit()
```

### 3.3 Tally Mix Integration

Use Platform's quantity optimization:

```python
async def get_optimized_quantities(
    client: PlatformAPIClient,
    location_id: str,
    materials: List[dict]
) -> List[dict]:
    """
    Get Platform's recommended tally mix for materials.

    Optimizes lumber quantities based on available lengths.
    """
    optimized = []

    for material in materials:
        if is_dimensional_lumber(material['sku']):
            result = await client.post(
                "quote/tally2mix",
                {
                    "locationId": location_id,
                    "sku": material['sku'],
                    "quantity": material['quantity'],
                    "erpSystem": client.erp_system
                }
            )

            optimized.append({
                "original": material,
                "tally_mix": result['tallyMix']
            })
        else:
            optimized.append({
                "original": material,
                "tally_mix": None
            })

    return optimized
```

### 3.4 Deliverables

- [ ] `pricing_sync.py` - Two-way pricing synchronization
- [ ] `tally_optimizer.py` - Quantity optimization integration
- [ ] Scheduled sync job (daily/on-demand)
- [ ] Price change reports
- [ ] Audit trail population

### 3.5 Success Criteria

- Pricing data flows from Platform to BAT
- All price changes logged in audit_trail
- Tally mix recommendations integrated
- Historical pricing analysis possible

---

## Phase 4: Bidirectional Sync (Weeks 13-20)

### Objective
Establish continuous synchronization between BAT and Platform.

### 4.1 Change Detection

```python
class SyncManager:
    def __init__(self, bat_db, platform_client):
        self.bat_db = bat_db
        self.platform_client = platform_client
        self.last_sync = None

    async def detect_changes(self) -> dict:
        """
        Detect changes since last sync in both systems.
        """
        bat_changes = self._get_bat_changes_since(self.last_sync)
        platform_changes = await self._get_platform_changes_since(self.last_sync)

        return {
            "bat_to_platform": bat_changes,
            "platform_to_bat": platform_changes,
            "conflicts": self._detect_conflicts(bat_changes, platform_changes)
        }

    def _detect_conflicts(self, bat_changes, platform_changes) -> List[dict]:
        """
        Identify items changed in both systems (conflict resolution needed).
        """
        bat_skus = {c['sku'] for c in bat_changes}
        platform_skus = {c['sku'] for c in platform_changes}

        conflicting_skus = bat_skus & platform_skus

        return [
            {
                "sku": sku,
                "bat_change": next(c for c in bat_changes if c['sku'] == sku),
                "platform_change": next(c for c in platform_changes if c['sku'] == sku)
            }
            for sku in conflicting_skus
        ]
```

### 4.2 Conflict Resolution Strategy

| Conflict Type | Resolution Rule |
|---------------|-----------------|
| Quantity change in both | BAT wins (source of truth for quantities) |
| Price change in both | Platform wins (source of truth for pricing) |
| SKU replacement | Platform wins (they manage SKU lifecycle) |
| New material | BAT wins (they create new takeoffs) |
| Deleted material | Require human review |

### 4.3 Sync Workflow

```python
async def run_sync(sync_manager: SyncManager) -> dict:
    """
    Full synchronization workflow.

    Steps:
    1. Detect changes in both systems
    2. Resolve conflicts per rules
    3. Apply BAT → Platform changes
    4. Apply Platform → BAT changes
    5. Update sync timestamp
    6. Generate report
    """
    # 1. Detect
    changes = await sync_manager.detect_changes()

    # 2. Resolve conflicts
    resolved = sync_manager.resolve_conflicts(changes['conflicts'])

    # 3. Apply BAT → Platform
    for change in changes['bat_to_platform']:
        if change['type'] == 'quantity':
            await sync_manager.update_platform_quantity(change)
        elif change['type'] == 'new_material':
            await sync_manager.add_material_to_platform(change)

    # 4. Apply Platform → BAT
    for change in changes['platform_to_bat']:
        if change['type'] == 'price':
            sync_manager.update_bat_price(change)
        elif change['type'] == 'sku_replacement':
            sync_manager.replace_bat_sku(change)

    # 5. Update timestamp
    sync_manager.last_sync = datetime.now()

    # 6. Report
    return {
        "bat_to_platform": len(changes['bat_to_platform']),
        "platform_to_bat": len(changes['platform_to_bat']),
        "conflicts_resolved": len(resolved),
        "sync_time": sync_manager.last_sync
    }
```

### 4.4 Deliverables

- [ ] `sync_manager.py` - Bidirectional sync engine
- [ ] `conflict_resolver.py` - Conflict detection and resolution
- [ ] Webhook handlers for real-time sync (if Platform supports)
- [ ] Sync dashboard/monitoring
- [ ] Manual conflict resolution UI

### 4.5 Success Criteria

- Changes propagate within 5 minutes (real-time) or daily (batch)
- < 1% conflict rate
- All conflicts have clear resolution path
- Full audit trail of all syncs

---

## Phase 5: MindFlow Unification (Weeks 21-32)

### Objective
MindFlow becomes the single interface for both systems.

### 5.1 Unified Data Model

```typescript
// MindFlow unified material type
interface UnifiedMaterial {
  // Identity
  id: string;                    // MindFlow UUID
  batCode: string;               // 1670-010.000-A-1000
  platformSku: string;           // 24DF

  // Core data
  description: string;
  quantity: number;
  unit: string;

  // Classification
  plan: string;
  phase: string;
  elevation: string;
  category: string;

  // Pricing
  unitPrice: number;
  extendedPrice: number;
  lastPriceUpdate: Date;

  // Metadata
  source: 'bat' | 'platform' | 'manual';
  lastSync: Date;
  version: number;
}
```

### 5.2 MindFlow API Layer

```typescript
// MindFlow backend service
class MaterialService {
  private batConnector: BATConnector;
  private platformConnector: PlatformConnector;
  private syncManager: SyncManager;

  async getMaterialsByPlan(planCode: string): Promise<UnifiedMaterial[]> {
    // Fetch from both sources and merge
    const batMaterials = await this.batConnector.getMaterials(planCode);
    const platformMaterials = await this.platformConnector.getMaterials(planCode);

    return this.mergeAndUnify(batMaterials, platformMaterials);
  }

  async updateMaterial(id: string, updates: Partial<UnifiedMaterial>): Promise<void> {
    // Determine which system to update based on field
    if (updates.quantity !== undefined) {
      // Quantity changes go to BAT
      await this.batConnector.updateQuantity(id, updates.quantity);
    }

    if (updates.unitPrice !== undefined) {
      // Price changes go to Platform (or flag for review)
      await this.platformConnector.updatePrice(id, updates.unitPrice);
    }

    // Trigger sync
    await this.syncManager.syncItem(id);
  }
}
```

### 5.3 UI Components

Leverage the uploaded `QuoteDashboard.jsx` patterns for:

- Material list grid with filtering/sorting
- Inline editing with real-time sync
- Bulk operations (category reassignment, quantity updates)
- Export to multiple formats
- Pricing refresh triggers
- Sync status indicators

### 5.4 Deliverables

- [ ] MindFlow Material Management module
- [ ] Unified API endpoints
- [ ] Real-time sync indicators in UI
- [ ] Conflict resolution UI
- [ ] Comprehensive dashboard

### 5.5 Success Criteria

- Single interface for all material operations
- Real-time data from both BAT and Platform
- Seamless user experience (no need to know which system)
- Sub-second response times

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Platform API changes | High | Version lock APIs, monitor for deprecations |
| SKU mismatches | Medium | Pre-validation, fuzzy matching fallback |
| Data volume performance | Medium | Pagination, caching, incremental sync |
| Network reliability | Medium | Retry logic, offline queue, conflict resolution |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Richmond/Holt code drift | High | Regular validation against source systems |
| Pricing data staleness | High | Configurable sync frequency, staleness alerts |
| User adoption | Medium | Training, documentation, gradual rollout |

---

## Resource Requirements

### Development Team

| Role | Effort | Phase |
|------|--------|-------|
| Backend Developer | 0.5 FTE | Phases 1-4 |
| Frontend Developer | 0.25 FTE | Phase 5 |
| QA Engineer | 0.25 FTE | All phases |
| DevOps | 0.1 FTE | Phases 2-5 |

### Infrastructure

- BAT database hosting (SQLite → PostgreSQL for production)
- API gateway for Platform communication
- Message queue for async sync (optional)
- Monitoring and alerting

---

## Success Metrics

### Phase 1-2 Metrics
- Export/Import success rate: > 99%
- SKU validation accuracy: > 98%
- Import time: < 30 seconds per plan

### Phase 3-4 Metrics
- Price sync latency: < 5 minutes
- Conflict rate: < 1%
- Audit trail completeness: 100%

### Phase 5 Metrics
- User satisfaction: > 4/5
- Time savings: > 50% vs manual process
- Data accuracy: > 99.5%

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| **Phase 1:** Export Foundation | Weeks 1-4 | BAT exports Platform-compatible files |
| **Phase 2:** API Integration | Weeks 5-8 | Automated import via API |
| **Phase 3:** Pricing Integration | Weeks 9-12 | Two-way pricing sync |
| **Phase 4:** Bidirectional Sync | Weeks 13-20 | Continuous synchronization |
| **Phase 5:** MindFlow Unification | Weeks 21-32 | Single unified interface |

**Total Timeline: 32 weeks (8 months)**

---

## Next Steps

### Immediate Actions (This Week)

1. **Validate export format** - Manually create export from BAT and test import
2. **Document Platform API** - Get full API documentation from Platform team
3. **Set up test environment** - Platform sandbox for integration testing
4. **Create Phase 1 backlog** - Detailed task breakdown

### Stakeholder Alignment

- [ ] Review plan with Richmond team
- [ ] Review plan with Holt team
- [ ] Review plan with Platform team
- [ ] Get sign-off on conflict resolution rules
- [ ] Establish communication cadence

---

## Appendix A: Code Translation Reference

### Pack Code Mappings (Platform → BAT)

| Platform Pack | BAT Phase Code | Category |
|---------------|----------------|----------|
| \|10 | 010.000 | FOUNDATION |
| \|18 | 018.000 | MAIN DECKING |
| \|20 | 020.000 | MAIN WALLS |
| \|20rf | 020.100 | MAIN WALLS READYFRAME |
| \|30 | 030.000 | 2ND FLOOR SYSTEM |
| \|32 | 032.000 | 2ND FLOOR SUBFLOOR |
| \|34 | 034.000 | 2ND FLOOR WALLS |
| \|34rf | 034.100 | 2ND FLOOR WALLS READYFRAME |
| \|40 | 040.000 | ROOF |
| \|58 | 058.000 | HOUSEWRAP |
| \|60 | 060.000 | EXTERIOR TRIM AND SIDING |

### Option Code Mappings

| Option Suffix | BAT Minor Code | Description |
|---------------|----------------|-------------|
| .82 | .820 | Den Option |
| .6 | .600 | Extended Great Room |
| .4x | .040 | Garage Extension |
| rf | .100 | ReadyFrame |
| pw1 | .101 | Post Wrap |
| tc | .900 | Tall Crawl |

---

## Appendix B: API Endpoint Reference

See `/docs/potentially_useful_information/` for full API implementations:

- `serviceRequestApi.ts` - Import endpoint
- `customerApi.ts` - SKU search, tally mix
- `quoteApi.ts` - Pricing, quote packs
- `projectApi.ts` - Bulk operations
- `baseQueries.ts` - Authentication patterns

---

*This document should be reviewed and updated as implementation progresses.*
