-- ============================================================================
-- BAT INTEGRATION DATABASE SCHEMA v1.0
-- ============================================================================
-- Project: Richmond & Holt BAT Consolidation
-- Purpose: Unified database structure for material management and pricing
-- Created: November 2025
-- Status: DRAFT - Subject to revision after team review
--
-- DESIGN PRINCIPLES:
-- 1. Elevation as separate dimension (fixes triple-encoding problem)
-- 2. Hybrid pack approach (universal + plan-specific capability)
-- 3. Relational option tracking (not embedded in item codes)
-- 4. Preserves both Richmond and Holt structures
-- 5. Supports historical pricing and auditing
-- ============================================================================

-- ============================================================================
-- CORE ENTITY TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PLANS: Master plan catalog
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_code VARCHAR(10) NOT NULL UNIQUE,
    plan_name VARCHAR(100),
    base_sqft INTEGER,
    main_floor_sqft INTEGER,
    upper_floor_sqft INTEGER,
    garage_sqft INTEGER,
    default_garage_config VARCHAR(50),
    builder VARCHAR(50), -- 'Richmond', 'Holt', 'Manor' (future)
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    CHECK (base_sqft >= 0),
    CHECK (main_floor_sqft >= 0),
    CHECK (upper_floor_sqft >= 0),
    CHECK (garage_sqft >= 0),
    CHECK (builder IN ('Richmond', 'Holt', 'Manor'))
);

-- Index for fast lookups by code
CREATE INDEX idx_plans_code ON plans(plan_code);
CREATE INDEX idx_plans_builder ON plans(builder);
CREATE INDEX idx_plans_active ON plans(is_active);

-- ----------------------------------------------------------------------------
-- ELEVATIONS: Plan elevation variations
-- ----------------------------------------------------------------------------
-- DESIGN DECISION 2: Elevation as separate dimension
-- Fixes triple-encoding problem where elevation appears in sheet name,
-- Plan Index column, and potentially item codes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS elevations (
    elevation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    elevation_code VARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    elevation_name VARCHAR(100), -- 'Northwest', 'Prairie', 'Modern', 'Farmhouse'
    elevation_description TEXT,
    sort_order INTEGER DEFAULT 0, -- For display ordering
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    UNIQUE(plan_id, elevation_code),
    CHECK (elevation_code IN ('A', 'B', 'C', 'D', 'E'))
);

-- Indexes
CREATE INDEX idx_elevations_plan ON elevations(plan_id);
CREATE INDEX idx_elevations_code ON elevations(elevation_code);
CREATE INDEX idx_elevations_active ON elevations(is_active);

-- ----------------------------------------------------------------------------
-- COMMUNITIES: Builder subdivisions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communities (
    community_id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_code VARCHAR(10) NOT NULL UNIQUE,
    community_name VARCHAR(100) NOT NULL,
    community_number INTEGER, -- e.g., 106, 107, 110, 111, 98, 99
    builder VARCHAR(50), -- 'Richmond', 'Holt', 'Manor'
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    effective_date DATE,
    closed_date DATE,
    notes TEXT,
    
    -- Constraints
    CHECK (builder IN ('Richmond', 'Holt', 'Manor'))
);

-- Indexes
CREATE INDEX idx_communities_code ON communities(community_code);
CREATE INDEX idx_communities_builder ON communities(builder);
CREATE INDEX idx_communities_active ON communities(is_active);

-- ----------------------------------------------------------------------------
-- PLAN_COMMUNITY_ASSOCIATION: Many-to-many relationship
-- ----------------------------------------------------------------------------
-- Tracks which plans are available in which communities
-- Supports elevation-specific assignments (some elevations only in certain communities)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_community_association (
    association_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    elevation_id INTEGER, -- NULL = all elevations, otherwise specific elevation
    is_active BOOLEAN DEFAULT 1,
    effective_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE,
    FOREIGN KEY (elevation_id) REFERENCES elevations(elevation_id) ON DELETE SET NULL,
    UNIQUE(plan_id, community_id, elevation_id)
);

-- Indexes
CREATE INDEX idx_plan_comm_plan ON plan_community_association(plan_id);
CREATE INDEX idx_plan_comm_community ON plan_community_association(community_id);
CREATE INDEX idx_plan_comm_elevation ON plan_community_association(elevation_id);

-- ============================================================================
-- MATERIAL ORGANIZATION TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PACKS: Material groupings (Foundation, Framing, Roofing, etc.)
-- ----------------------------------------------------------------------------
-- DESIGN DECISION 1: Hybrid approach - supports both universal and plan-specific packs
-- Pack type digit maps to Holt's 5th digit in 9-digit system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packs (
    pack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_code VARCHAR(10) NOT NULL UNIQUE,
    pack_name VARCHAR(100) NOT NULL,
    pack_type_digit INTEGER NOT NULL, -- Maps to digit 5 in Holt's PPPPPCCCSS system
    pack_category VARCHAR(50), -- 'STRUCTURAL', 'FINISH', 'SPECIALTY', etc.
    is_universal BOOLEAN DEFAULT 1, -- TRUE = used by multiple plans, FALSE = plan-specific
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    CHECK (pack_type_digit BETWEEN 1 AND 9)
);

-- Indexes
CREATE INDEX idx_packs_code ON packs(pack_code);
CREATE INDEX idx_packs_type ON packs(pack_type_digit);
CREATE INDEX idx_packs_universal ON packs(is_universal);
CREATE INDEX idx_packs_active ON packs(is_active);

-- Example pack type digit definitions (to be finalized in Phase 1):
-- 1 = Foundation / Below Grade
-- 2 = Framing / Structural
-- 3 = Roofing
-- 4 = Exterior Finishes
-- 5 = Interior Finishes
-- 6 = Specialties
-- 7 = [Reserve]
-- 8 = [Reserve]
-- 9 = Options / Upgrades

-- ----------------------------------------------------------------------------
-- PACK_ASSIGNMENTS: Links packs to plans
-- ----------------------------------------------------------------------------
-- Tracks which packs are used by which plans
-- Supports plan-specific overrides of universal packs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pack_assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    pack_id INTEGER NOT NULL,
    is_override BOOLEAN DEFAULT 0, -- TRUE if this is a plan-specific override
    parent_pack_id INTEGER, -- References universal pack if this is an override
    is_active BOOLEAN DEFAULT 1,
    effective_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_pack_id) REFERENCES packs(pack_id) ON DELETE SET NULL,
    UNIQUE(plan_id, pack_id)
);

-- Indexes
CREATE INDEX idx_pack_assign_plan ON pack_assignments(plan_id);
CREATE INDEX idx_pack_assign_pack ON pack_assignments(pack_id);
CREATE INDEX idx_pack_assign_active ON pack_assignments(is_active);

-- ============================================================================
-- MATERIAL ITEMS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BFS_MATERIALS: Master material catalog from Builder's FirstSource
-- ----------------------------------------------------------------------------
-- Single source of truth for all BFS SKUs
-- This is the authoritative material database
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bfs_materials (
    bfs_sku VARCHAR(20) PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    unit_of_measure VARCHAR(20), -- 'EA', 'LF', 'SF', 'MBF', etc.
    category VARCHAR(100),
    subcategory VARCHAR(100),
    product_line VARCHAR(100),
    manufacturer VARCHAR(100),
    vendor_sku VARCHAR(50),
    is_stocked BOOLEAN DEFAULT 1,
    lead_time_days INTEGER,
    weight_per_unit DECIMAL(10, 4),
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Indexes
CREATE INDEX idx_bfs_category ON bfs_materials(category);
CREATE INDEX idx_bfs_subcategory ON bfs_materials(subcategory);
CREATE INDEX idx_bfs_active ON bfs_materials(is_active);
CREATE INDEX idx_bfs_description ON bfs_materials(description);

-- ----------------------------------------------------------------------------
-- MATERIAL_ITEMS: Internal material items (Holt's 9-digit system)
-- ----------------------------------------------------------------------------
-- Maps internal item codes to BFS materials
-- Supports plan-specific and universal items
-- Item code format: PPPPPCCCSS (Plan-Pack-Category-Sequence)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code VARCHAR(20) NOT NULL UNIQUE, -- Holt's 9-digit code or similar
    plan_id INTEGER, -- NULL for universal items
    pack_id INTEGER NOT NULL,
    category_code VARCHAR(10), -- Digits 6-7 from Holt's system
    sequence_number VARCHAR(10), -- Digits 8-9 from Holt's system
    bfs_sku VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    base_quantity DECIMAL(12, 4), -- Base quantity before elevation adjustments
    unit_of_measure VARCHAR(20),
    is_universal BOOLEAN DEFAULT 0, -- TRUE if applies to multiple plans
    is_optional BOOLEAN DEFAULT 0, -- TRUE if this is an optional item
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE CASCADE,
    FOREIGN KEY (bfs_sku) REFERENCES bfs_materials(bfs_sku)
);

-- Indexes
CREATE INDEX idx_items_code ON material_items(item_code);
CREATE INDEX idx_items_plan ON material_items(plan_id);
CREATE INDEX idx_items_pack ON material_items(pack_id);
CREATE INDEX idx_items_bfs_sku ON material_items(bfs_sku);
CREATE INDEX idx_items_category ON material_items(category_code);
CREATE INDEX idx_items_active ON material_items(is_active);

-- ----------------------------------------------------------------------------
-- ITEM_ELEVATIONS: Elevation-specific quantity overrides
-- ----------------------------------------------------------------------------
-- Stores quantities that vary by elevation
-- If no record exists, use base_quantity from material_items
-- Supports Holt's pattern where same item has different quantities per elevation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item_elevations (
    item_elevation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    elevation_id INTEGER NOT NULL,
    quantity DECIMAL(12, 4) NOT NULL,
    quantity_override_reason VARCHAR(200),
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (item_id) REFERENCES material_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (elevation_id) REFERENCES elevations(elevation_id) ON DELETE CASCADE,
    UNIQUE(item_id, elevation_id),
    CHECK (quantity >= 0)
);

-- Indexes
CREATE INDEX idx_item_elev_item ON item_elevations(item_id);
CREATE INDEX idx_item_elev_elevation ON item_elevations(elevation_id);

-- ============================================================================
-- OPTIONS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- OPTIONS: Available options (garage configs, interior upgrades, etc.)
-- ----------------------------------------------------------------------------
-- DESIGN DECISION 3: Relational option tracking
-- Format: OPT-[Category]-[Number]
-- Categories: GAR (Garage), INT (Interior), STR (Structural), EXT (Exterior)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS options (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    option_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'OPT-GAR-301'
    option_name VARCHAR(100) NOT NULL,
    option_category VARCHAR(20) NOT NULL, -- 'GAR', 'INT', 'STR', 'EXT'
    option_description TEXT,
    base_price DECIMAL(10, 2), -- Base pricing if applicable
    is_active BOOLEAN DEFAULT 1,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    CHECK (option_category IN ('GAR', 'INT', 'STR', 'EXT'))
);

-- Indexes
CREATE INDEX idx_options_code ON options(option_code);
CREATE INDEX idx_options_category ON options(option_category);
CREATE INDEX idx_options_active ON options(is_active);

-- ----------------------------------------------------------------------------
-- ITEM_OPTIONS: Links options to material items
-- ----------------------------------------------------------------------------
-- Tracks which items are affected by which options
-- Quantity modifier: +1 (add), -1 (remove), *2 (double), etc.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item_options (
    item_option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    quantity_modifier VARCHAR(10), -- '+1', '-1', '*2', '0.5', etc.
    is_required BOOLEAN DEFAULT 0, -- TRUE if this item is required when option selected
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (item_id) REFERENCES material_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(option_id) ON DELETE CASCADE,
    UNIQUE(item_id, option_id)
);

-- Indexes
CREATE INDEX idx_item_opt_item ON item_options(item_id);
CREATE INDEX idx_item_opt_option ON item_options(option_id);

-- ----------------------------------------------------------------------------
-- PLAN_OPTIONS: Which options are available for which plans
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_options (
    plan_option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    is_standard BOOLEAN DEFAULT 0, -- TRUE if included in base price
    is_available BOOLEAN DEFAULT 1, -- TRUE if option can be selected
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(option_id) ON DELETE CASCADE,
    UNIQUE(plan_id, option_id)
);

-- Indexes
CREATE INDEX idx_plan_opt_plan ON plan_options(plan_id);
CREATE INDEX idx_plan_opt_option ON plan_options(option_id);

-- ============================================================================
-- PRICING TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PRICE_LEVELS: Customer pricing tiers
-- ----------------------------------------------------------------------------
-- Richmond uses L1-L5, Holt uses PL01-PL12
-- This table maps between systems
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_levels (
    price_level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_level_code VARCHAR(10) NOT NULL UNIQUE, -- 'L1', 'PL01', etc.
    price_level_name VARCHAR(100),
    builder VARCHAR(50), -- 'Richmond', 'Holt'
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    
    -- Constraints
    CHECK (builder IN ('Richmond', 'Holt', 'Manor'))
);

-- Indexes
CREATE INDEX idx_price_levels_code ON price_levels(price_level_code);
CREATE INDEX idx_price_levels_builder ON price_levels(builder);

-- ----------------------------------------------------------------------------
-- PRICING_HISTORY: Time-series pricing data
-- ----------------------------------------------------------------------------
-- Tracks all price changes over time
-- Supports both Richmond and Holt pricing structures
-- Enables historical cost analysis
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_history (
    pricing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bfs_sku VARCHAR(20) NOT NULL,
    price_level_id INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE, -- NULL = current price
    base_cost DECIMAL(10, 4) NOT NULL,
    freight_per_unit DECIMAL(10, 4) DEFAULT 0,
    freight_mbf DECIMAL(10, 4), -- For Random Length lumber
    margin_percent DECIMAL(5, 2) DEFAULT 0,
    final_price DECIMAL(10, 4) NOT NULL,
    source VARCHAR(50), -- 'IWP', 'RL', 'Manual', 'Import'
    import_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (bfs_sku) REFERENCES bfs_materials(bfs_sku),
    FOREIGN KEY (price_level_id) REFERENCES price_levels(price_level_id),
    CHECK (base_cost >= 0),
    CHECK (final_price >= 0)
);

-- Indexes
CREATE INDEX idx_pricing_sku ON pricing_history(bfs_sku);
CREATE INDEX idx_pricing_level ON pricing_history(price_level_id);
CREATE INDEX idx_pricing_date ON pricing_history(effective_date);
CREATE INDEX idx_pricing_current ON pricing_history(end_date) WHERE end_date IS NULL;

-- Composite index for fast current price lookups
CREATE INDEX idx_pricing_lookup ON pricing_history(bfs_sku, price_level_id, effective_date);

-- ============================================================================
-- AUDIT AND TRACKING TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CHANGE_LOG: Audit trail for all modifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS change_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    changed_by VARCHAR(100),
    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values TEXT, -- JSON representation of old values
    new_values TEXT, -- JSON representation of new values
    notes TEXT,
    
    -- Constraints
    CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes
CREATE INDEX idx_changelog_table ON change_log(table_name);
CREATE INDEX idx_changelog_date ON change_log(change_date);
CREATE INDEX idx_changelog_user ON change_log(changed_by);

-- ----------------------------------------------------------------------------
-- IMPORT_BATCHES: Tracks data import operations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_batches (
    batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_name VARCHAR(100) NOT NULL,
    source_file VARCHAR(500),
    import_type VARCHAR(50), -- 'PLANS', 'MATERIALS', 'PRICING', 'FULL'
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    imported_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'RUNNING', -- 'RUNNING', 'COMPLETED', 'FAILED'
    error_log TEXT,
    notes TEXT,
    
    -- Constraints
    CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Indexes
CREATE INDEX idx_import_date ON import_batches(start_time);
CREATE INDEX idx_import_status ON import_batches(status);
CREATE INDEX idx_import_type ON import_batches(import_type);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- vw_plan_full_details: Complete plan information with elevations and communities
-- ----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS vw_plan_full_details AS
SELECT 
    p.plan_id,
    p.plan_code,
    p.plan_name,
    p.base_sqft,
    p.main_floor_sqft,
    p.upper_floor_sqft,
    p.garage_sqft,
    p.default_garage_config,
    p.builder,
    e.elevation_id,
    e.elevation_code,
    e.elevation_name,
    c.community_id,
    c.community_code,
    c.community_name,
    pca.is_active AS is_active_in_community
FROM plans p
LEFT JOIN elevations e ON p.plan_id = e.plan_id
LEFT JOIN plan_community_association pca ON p.plan_id = pca.plan_id 
    AND (pca.elevation_id IS NULL OR pca.elevation_id = e.elevation_id)
LEFT JOIN communities c ON pca.community_id = c.community_id
WHERE p.is_active = 1;

-- ----------------------------------------------------------------------------
-- vw_current_pricing: Latest pricing for all materials
-- ----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS vw_current_pricing AS
SELECT 
    bm.bfs_sku,
    bm.description,
    bm.unit_of_measure,
    bm.category,
    pl.price_level_code,
    pl.price_level_name,
    ph.base_cost,
    ph.freight_per_unit,
    ph.margin_percent,
    ph.final_price,
    ph.effective_date
FROM bfs_materials bm
JOIN pricing_history ph ON bm.bfs_sku = ph.bfs_sku
JOIN price_levels pl ON ph.price_level_id = pl.price_level_id
WHERE ph.end_date IS NULL
    AND bm.is_active = 1
    AND pl.is_active = 1;

-- ----------------------------------------------------------------------------
-- vw_material_list_summary: Material counts by plan and pack
-- ----------------------------------------------------------------------------
CREATE VIEW IF NOT EXISTS vw_material_list_summary AS
SELECT 
    p.plan_code,
    p.plan_name,
    pk.pack_name,
    COUNT(DISTINCT mi.item_id) AS item_count,
    COUNT(DISTINCT mi.bfs_sku) AS unique_skus,
    SUM(mi.base_quantity) AS total_base_quantity
FROM plans p
JOIN pack_assignments pa ON p.plan_id = pa.plan_id
JOIN packs pk ON pa.pack_id = pk.pack_id
JOIN material_items mi ON pk.pack_id = mi.pack_id
WHERE p.is_active = 1
    AND pk.is_active = 1
    AND mi.is_active = 1
GROUP BY p.plan_id, pk.pack_id;

-- ============================================================================
-- REFERENCE DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Insert initial price levels
-- ----------------------------------------------------------------------------
-- Richmond price levels
INSERT INTO price_levels (price_level_code, price_level_name, builder, sort_order) VALUES
('L1', 'Richmond Level 1', 'Richmond', 1),
('L2', 'Richmond Level 2', 'Richmond', 2),
('L3', 'Richmond Level 3', 'Richmond', 3),
('L4', 'Richmond Level 4', 'Richmond', 4),
('L5', 'Richmond Level 5', 'Richmond', 5);

-- Holt price levels
INSERT INTO price_levels (price_level_code, price_level_name, builder, sort_order) VALUES
('PL01', 'Holt Price Level 01', 'Holt', 11),
('PL02', 'Holt Price Level 02', 'Holt', 12),
('PL03', 'Holt Price Level 03', 'Holt', 13),
('PL04', 'Holt Price Level 04', 'Holt', 14),
('PL05', 'Holt Price Level 05', 'Holt', 15),
('PL06', 'Holt Price Level 06', 'Holt', 16),
('PL07', 'Holt Price Level 07', 'Holt', 17),
('PL08', 'Holt Price Level 08', 'Holt', 18),
('PL09', 'Holt Price Level 09', 'Holt', 19),
('PL10', 'Holt Price Level 10', 'Holt', 20),
('PL11', 'Holt Price Level 11', 'Holt', 21),
('PL12', 'Holt Price Level 12', 'Holt', 22);

-- ----------------------------------------------------------------------------
-- Insert initial communities
-- ----------------------------------------------------------------------------
INSERT INTO communities (community_code, community_name, community_number, builder) VALUES
-- Holt communities
('GG', 'Golden Grove', 106, 'Holt'),
('CR', 'Coyote Ridge', 111, 'Holt'),
('HH', 'Harmony Heights', 107, 'Holt'),
('HA', 'Heartwood Acres', 99, 'Holt'),
('WR', 'Willow Ridge', 98, 'Holt'),
('WRA', 'Willow Ridge Attached', 110, 'Holt'),
-- Richmond communities
('LE', 'Luden Estates', NULL, 'Richmond');

-- ----------------------------------------------------------------------------
-- Insert initial pack types (to be expanded during Phase 1)
-- ----------------------------------------------------------------------------
INSERT INTO packs (pack_code, pack_name, pack_type_digit, pack_category, is_universal, sort_order) VALUES
('FOUND', 'Foundation', 1, 'STRUCTURAL', 1, 10),
('FRAME', 'Framing', 2, 'STRUCTURAL', 1, 20),
('ROOF', 'Roofing', 3, 'STRUCTURAL', 1, 30),
('EXTFIN', 'Exterior Finishes', 4, 'FINISH', 1, 40),
('INTFIN', 'Interior Finishes', 5, 'FINISH', 1, 50),
('SPEC', 'Specialties', 6, 'SPECIALTY', 1, 60),
('OPTS', 'Options/Upgrades', 9, 'OPTIONAL', 0, 90);

-- ============================================================================
-- SCHEMA NOTES AND DECISIONS
-- ============================================================================

/*
KEY DESIGN DECISIONS (to be finalized in Phase 1):

DECISION 1: Plan-Pack Relationship
  Current: Hybrid approach
  - Universal packs (is_universal=1) can be assigned to multiple plans
  - Plan-specific packs (is_universal=0) for customizations
  - pack_assignments table manages relationships
  Rationale: Provides flexibility while reducing duplication

DECISION 2: Plan-Elevation Model
  Current: Elevation as separate dimension
  - Fixes triple-encoding problem
  - Plan Index Column C becomes source of truth
  - Elevations stored in dedicated table
  - Item quantities can vary by elevation in item_elevations table
  Rationale: Cleanest relational model, matches existing Plan Index structure

DECISION 3: Internal Option Codes
  Current: Relational approach
  - Options in dedicated table with OPT-[Category]-[Number] codes
  - item_options junction table links items to options
  - Quantity modifiers support add/remove/multiply operations
  Rationale: Most flexible, supports complex option combinations

HOLT 9-DIGIT SYSTEM INTEGRATION:
  Format: PPPPPCCCSS
  - PPPP (digits 1-4): Plan code
  - P (digit 5): Pack type (maps to packs.pack_type_digit)
  - CC (digits 6-7): Category code (stored in material_items.category_code)
  - SS (digits 8-9): Sequence number (stored in material_items.sequence_number)
  
  Elevation Handling:
  - Holt encodes elevations in category: 01=A, 02=B, 03=C, 04=D
  - We store this in item_elevations table instead
  - Preserves item_code for reference but uses proper relational structure

RICHMOND INTEGRATION:
  - Richmond lacks structured item numbering
  - Will adopt Holt's 9-digit system during migration
  - Plan codes remain alphanumeric (G603, G914)
  - Price levels (L1-L5) map to price_levels table

FUTURE ENHANCEMENTS:
  - Add tables for job tracking
  - Add tables for purchase order management
  - Integration with existing "Prideboard tool"
  - SharePoint synchronization
  - Real-time pricing updates from BFS systems
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Version: 1.0 DRAFT
-- Next Steps: 
--   1. Complete Phase 1 decision-making
--   2. Review with team (William & Alicia)
--   3. Finalize schema based on feedback
--   4. Begin data migration planning (Week 2)
-- ============================================================================
