-- BAT System v2.0 Database Schema
-- PostgreSQL 15+
-- Based on Holt BAT Excel structure analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Categories (DART codes from Excel columns W, X)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    dart_code VARCHAR(20),           -- Column W: DART CATAGOTY
    minor_code VARCHAR(20),           -- Column X: MINOR CATAGOTRY
    created_at TIMESTAMP DEFAULT NOW()
);

-- Materials (core inventory)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,              -- Column F: Sku
    description TEXT NOT NULL,                    -- Column B: DESCRIPTION
    online_description TEXT,                      -- Column K: ONLINE DESCRIPTION
    category_id INTEGER REFERENCES categories(id),
    uom VARCHAR(20),                             -- Column L: UOM
    format1 VARCHAR(20),                         -- Column D (from Excel)
    format2 VARCHAR(20),                         -- Column E (from Excel)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast SKU lookups (replaces Excel VLOOKUP)
CREATE INDEX idx_materials_sku ON materials(sku);
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_active ON materials(is_active);

-- ============================================================================
-- PRICING TABLES (Excel columns H, K, L, M, N, P, Q, R, S, T, U, V)
-- ============================================================================

-- Price levels (Excel row 3-4 customer pricing: "01", "02", "L5", etc.)
CREATE TABLE price_levels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,  -- "01", "02", "03", "L5", etc.
    name VARCHAR(100),
    markup_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(200),
    is_active BOOLEAN DEFAULT true
);

-- Material base pricing (cost per UOM)
CREATE TABLE material_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    cost_per_uom DECIMAL(10,4) NOT NULL,         -- Column V: COST/EA
    uom_cost VARCHAR(20),                        -- Column U: UOM COST
    conversion_factor DECIMAL(10,4),             -- Column N: CONVER
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pricing_material ON material_pricing(material_id);
CREATE INDEX idx_pricing_dates ON material_pricing(effective_date, expiration_date);

-- Customer-specific pricing (Excel column H calculation)
CREATE TABLE customer_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    price_level_id INTEGER REFERENCES price_levels(id),
    custom_price DECIMAL(10,4),                  -- Column H: PRICE (calculated)
    sell_each DECIMAL(10,4),                     -- Column T: SELL/EA
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    UNIQUE(customer_id, material_id, effective_date)
);

-- Pricing update history (for monthly updates)
CREATE TABLE pricing_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50),  -- 'manual', 'api', 'supplier_feed'
    materials_updated INTEGER,
    avg_price_change_pct DECIMAL(5,2),
    updated_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PLAN TABLES (Excel plan sheets: 2336-B, 1670, etc.)
-- ============================================================================

-- Plans (Excel sheet names: "2336-B", "1670", "1890-A", etc.)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_code VARCHAR(50) UNIQUE NOT NULL,  -- "1670", "2336-B", "G18L"
    name VARCHAR(200),
    builder VARCHAR(100),  -- "Holt", "Richmond"
    square_footage INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_code ON plans(plan_code);
CREATE INDEX idx_plans_builder ON plans(builder);

-- Packs (Excel column A: Location like "05 UNDERFLOOR|", "|10ABCD FOUNDATION")
CREATE TABLE packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,          -- "10", "20", "05", etc.
    name VARCHAR(200),                  -- "FOUNDATION", "MAIN WALLS", "UNDERFLOOR"
    elevations VARCHAR(10)[],           -- ["A", "B", "C", "D"] or ["ELVA", "ELVB"]
    phase_code VARCHAR(10),
    display_order INTEGER,
    description TEXT
);

CREATE INDEX idx_packs_code ON packs(code);

-- Plan materials (Excel data rows - the core relationship)
-- Maps: Plan + Pack + Material = unified_code with quantity
CREATE TABLE plan_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES packs(id),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,

    -- Quantity (Excel column G: QTY)
    quantity DECIMAL(10,4) NOT NULL,

    -- Unified code from import tool
    unified_code VARCHAR(50),           -- "1670-101.000-AB-4085"

    -- Excel column A: Location string
    location_string VARCHAR(200),       -- "05 UNDERFLOOR|" or "|10ABCD FOUNDATION"

    -- Optional vs required
    is_optional BOOLEAN DEFAULT false,

    -- Notes/tally (Excel column C: TALLY)
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plan_materials_plan ON plan_materials(plan_id);
CREATE INDEX idx_plan_materials_pack ON plan_materials(pack_id);
CREATE INDEX idx_plan_materials_material ON plan_materials(material_id);
CREATE INDEX idx_plan_materials_code ON plan_materials(unified_code);

-- Plan options (like "OPT DEN", "REG3", etc. from pack names)
CREATE TABLE plan_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    option_code VARCHAR(50) NOT NULL,
    option_name VARCHAR(100),
    description TEXT,
    -- JSON structure for material add/remove/adjust
    material_adjustments JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- BID TABLES (Excel bid totals and calculations)
-- ============================================================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    default_price_level_id INTEGER REFERENCES price_levels(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bids (replaces manual Excel bid creation)
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    plan_id UUID REFERENCES plans(id),

    -- Status workflow
    status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'pending', 'approved', 'rejected'

    -- Dates
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Totals (Excel columns M, P, Q, R)
    total_cost DECIMAL(12,2),           -- Sum of column P: TTL COST
    total_sell DECIMAL(12,2),           -- Sum of column M: TTL SELL
    margin_dollars DECIMAL(12,2),       -- Column Q: MARGIN$
    margin_percent DECIMAL(5,2),        -- Column R: MARGIN%

    -- Metadata
    created_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bids_customer ON bids(customer_id);
CREATE INDEX idx_bids_plan ON bids(plan_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_dates ON bids(created_date, valid_until);

-- Bid line items (Excel rows in each plan sheet)
CREATE TABLE bid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    pack_code VARCHAR(50),

    -- Quantities and pricing (Excel columns)
    quantity DECIMAL(10,4),             -- Column G: QTY
    unit_cost DECIMAL(10,4),            -- Column V: COST/EA
    unit_sell DECIMAL(10,4),            -- Column H: PRICE
    line_total_cost DECIMAL(12,2),      -- Column P: TTL COST
    line_total_sell DECIMAL(12,2),      -- Column M: TTL SELL

    -- Flags
    is_optional BOOLEAN DEFAULT false,

    -- Position
    line_number INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bid_items_bid ON bid_items(bid_id);
CREATE INDEX idx_bid_items_material ON bid_items(material_id);

-- Bid revisions (track changes)
CREATE TABLE bid_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    revised_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revision_reason TEXT,
    price_delta DECIMAL(12,2),
    revised_by VARCHAR(100),
    -- Snapshot of bid at this revision
    bid_snapshot JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Material cost trends over time
CREATE VIEW v_material_cost_trends AS
SELECT
    m.sku,
    m.description,
    mp.effective_date,
    mp.cost_per_uom,
    LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    ) AS previous_cost,
    ((mp.cost_per_uom - LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    )) / NULLIF(LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    ), 0)) * 100 AS pct_change
FROM materials m
JOIN material_pricing mp ON m.id = mp.material_id
WHERE m.is_active = true;

-- Bid performance by month
CREATE VIEW v_bid_performance AS
SELECT
    DATE_TRUNC('month', b.created_date) AS month,
    COUNT(*) AS total_bids,
    COUNT(*) FILTER (WHERE b.status = 'approved') AS approved_bids,
    AVG(b.margin_percent) AS avg_margin,
    SUM(b.total_sell) FILTER (WHERE b.status = 'approved') AS approved_revenue,
    SUM(b.total_cost) FILTER (WHERE b.status = 'approved') AS approved_cost
FROM bids b
GROUP BY DATE_TRUNC('month', b.created_date);

-- Plan material summary (replaces Excel pivot tables)
CREATE VIEW v_plan_material_summary AS
SELECT
    p.plan_code,
    p.name AS plan_name,
    COUNT(DISTINCT pm.material_id) AS total_materials,
    COUNT(DISTINCT pm.pack_id) AS total_packs,
    SUM(pm.quantity) AS total_quantity
FROM plans p
JOIN plan_materials pm ON p.id = pm.plan_id
WHERE p.is_active = true
GROUP BY p.id, p.plan_code, p.name;

-- Bid totals by category (replaces Excel SUMIF formulas)
CREATE VIEW v_bid_totals_by_category AS
SELECT
    b.id AS bid_id,
    b.bid_number,
    c.name AS category_name,
    c.dart_code,
    COUNT(bi.id) AS item_count,
    SUM(bi.line_total_cost) AS category_cost,
    SUM(bi.line_total_sell) AS category_sell,
    SUM(bi.line_total_sell - bi.line_total_cost) AS category_margin_dollars,
    AVG((bi.line_total_sell - bi.line_total_cost) / NULLIF(bi.line_total_sell, 0)) AS category_margin_pct
FROM bids b
JOIN bid_items bi ON b.id = bi.bid_id
JOIN materials m ON bi.material_id = m.id
JOIN categories c ON m.category_id = c.id
GROUP BY b.id, b.bid_number, c.id, c.name, c.dart_code;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default price levels (from Excel)
INSERT INTO price_levels (code, name, markup_percentage) VALUES
('01', 'Wholesale', 5.00),
('02', 'Contractor', 15.00),
('03', 'Retail', 25.00),
('L5', 'Special Pricing', 10.00);

-- Default categories (from Excel DART codes)
INSERT INTO categories (name, dart_code, minor_code) VALUES
('Lumber', '1', '10'),
('Hardware', '2', '20'),
('Concrete', '3', '30'),
('Roofing', '4', '40'),
('Siding', '5', '50'),
('Windows/Doors', '6', '60'),
('Miscellaneous', '9', '90');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_plan_materials_lookup ON plan_materials(plan_id, pack_id, material_id);
CREATE INDEX idx_bid_items_totals ON bid_items(bid_id, line_total_cost, line_total_sell);
CREATE INDEX idx_material_pricing_current ON material_pricing(material_id, effective_date DESC)
    WHERE expiration_date IS NULL OR expiration_date > CURRENT_DATE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE materials IS 'Core material inventory - maps to Excel SKU list';
COMMENT ON TABLE plan_materials IS 'Plan-Pack-Material relationships - Excel data rows';
COMMENT ON TABLE bids IS 'Bid headers - replaces manual Excel bid creation';
COMMENT ON TABLE bid_items IS 'Bid line items - Excel bid rows with pricing';
COMMENT ON COLUMN materials.sku IS 'Excel Column F - Material SKU';
COMMENT ON COLUMN plan_materials.unified_code IS 'Format: PPPP-PPP.000-EE-IIII (from import tool)';
COMMENT ON COLUMN bid_items.line_total_sell IS 'Excel Column M - TTL SELL (calculated)';
COMMENT ON COLUMN bid_items.line_total_cost IS 'Excel Column P - TTL COST (calculated)';
