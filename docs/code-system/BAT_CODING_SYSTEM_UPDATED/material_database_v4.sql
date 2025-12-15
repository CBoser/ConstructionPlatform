-- ============================================================
-- MINDFLOW CONSTRUCTION PLATFORM - UNIFIED MATERIAL DATABASE
-- Generated: 2025-12-13 21:55:15
-- Coding Schema: BAT Unified Coding System v2.0 (Fluid Format)
-- ============================================================
--
-- PHASE CODE FORMAT: PPP.XXS (Fluid)
--   .000  = Base (no option, no suffix)
--   .00S  = Single-digit suffix only (S = 1-9)
--   .0ZZ  = Two-digit suffix only (ZZ = 10-19)
--   .XX0  = Two-digit option code only
--   .XXS  = Two-digit option + single-digit suffix
--
-- EXAMPLES:
--   010.820 = Optional Den (XX=82)
--   010.821 = Optional Den + ReadyFrame (XX=82, S=1)
--   034.613 = Loft→Bedroom + Loft variant (XX=61, S=3)
--   060.011 = Enhanced Corners (ZZ=11)
-- ============================================================


-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

-- Unified Item Types (Rosetta Stone)
CREATE TABLE IF NOT EXISTS unified_item_types (
    unified_code VARCHAR(4) PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    holt_cost_code VARCHAR(4),
    richmond_cost_code VARCHAR(4),
    pack_range VARCHAR(50),
    display_order INTEGER
);

-- Suffix Codes (Single and Two-digit)
CREATE TABLE IF NOT EXISTS suffix_codes (
    suffix_code VARCHAR(2) PRIMARY KEY,
    suffix_type VARCHAR(10) NOT NULL,  -- 'single' or 'two-digit'
    legacy_alpha VARCHAR(10),
    description VARCHAR(100) NOT NULL
);

-- Phase Codes (Fluid Format)
CREATE TABLE IF NOT EXISTS phase_codes (
    phase_code VARCHAR(10) PRIMARY KEY,
    phase_name VARCHAR(100) NOT NULL,
    legacy_pack VARCHAR(20),
    category VARCHAR(50),
    trade_code VARCHAR(4),
    unified_item_type VARCHAR(4) REFERENCES unified_item_types(unified_code),
    shipping_order INTEGER,
    format_pattern VARCHAR(50)  -- Documents which fluid pattern is used
);

-- Format Patterns Reference
CREATE TABLE IF NOT EXISTS format_patterns (
    pattern VARCHAR(10) PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    example VARCHAR(200)
);

-- Elevation Mapping
CREATE TABLE IF NOT EXISTS elevation_mapping (
    letter VARCHAR(2) PRIMARY KEY,
    digit VARCHAR(3),
    description VARCHAR(50)
);

-- Builders
CREATE TABLE IF NOT EXISTS builders (
    builder_id SERIAL PRIMARY KEY,
    builder_code VARCHAR(20) NOT NULL UNIQUE,
    builder_name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
    material_id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    bfs_description VARCHAR(300),
    rah_item_number VARCHAR(50),
    rah_description VARCHAR(300),
    unified_item_type VARCHAR(4) REFERENCES unified_item_types(unified_code),
    holt_cost_code VARCHAR(4),
    category VARCHAR(50),
    subcategory VARCHAR(50),
    unit_of_measure VARCHAR(20) DEFAULT 'EA',
    rl_base_price DECIMAL(10,4),
    freight_treating DECIMAL(10,4),
    margin_percent DECIMAL(5,4),
    factor DECIMAL(12,8),
    unit_cost DECIMAL(10,4),
    item_reference VARCHAR(20),
    is_commodity BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_sku ON materials(sku);
CREATE INDEX IF NOT EXISTS idx_materials_unified ON materials(unified_item_type);
CREATE INDEX IF NOT EXISTS idx_phase_codes_trade ON phase_codes(trade_code);
CREATE INDEX IF NOT EXISTS idx_phase_codes_order ON phase_codes(shipping_order);


-- ============================================================
-- SEED: UNIFIED ITEM TYPES
-- ============================================================

INSERT INTO unified_item_types (unified_code, description, holt_cost_code, richmond_cost_code, pack_range, display_order) VALUES
    ('1000', 'Framing/Lumber', '4085', '4085', '|00-49, |80+', 1),
    ('1100', 'Lumber - Barge Credit', '4086', '4086', '—', 2),
    ('1200', 'Trusses', '4120', '4120', '|40-45', 3),
    ('2000', 'Windows', '4140', '4140', '|40.xx', 4),
    ('2050', 'Windows - Triple Pane', '4142', '4142', '—', 5),
    ('2100', 'Siding/Exterior', '4155', '4155', '|58-79', 6),
    ('2150', 'Exterior Doors', '4150', '4150', '|83.xx', 7),
    ('2200', 'Roofing', '4156', '4156', '|50-57', 8),
    ('3000', 'Interior Trim/Millwork', '4320', '4320', '|83+', 9)
ON CONFLICT (unified_code) DO NOTHING;

-- ============================================================
-- SEED: FORMAT PATTERNS (Fluid Phase Code Structure)
-- ============================================================

INSERT INTO format_patterns (pattern, description, example) VALUES
    ('.000', 'Base (no option, no suffix)', '010.000 = Foundation'),
    ('.00S', 'Single-digit suffix only (S=1-9)', '010.008 = Foundation + Tall Crawl (S=8)'),
    ('.0ZZ', 'Two-digit suffix only (ZZ=10-19)', '060.011 = Enhanced Corners (ZZ=11)'),
    ('.XX0', 'Two-digit option code only', '010.820 = Optional Den (XX=82)'),
    ('.XXS', 'Two-digit option + single suffix', '010.821 = Optional Den + ReadyFrame (XX=82, S=1)')
ON CONFLICT (pattern) DO NOTHING;

-- ============================================================
-- SEED: SUFFIX CODES (Single and Two-digit)
-- ============================================================

INSERT INTO suffix_codes (suffix_code, suffix_type, legacy_alpha, description) VALUES
    ('1', 'single', 'rf', 'ReadyFrame'),
    ('2', 'single', '—', 'Reserved'),
    ('3', 'single', 'lo, l', 'Loft variant'),
    ('4', 'single', 'nl', 'No Loft variant'),
    ('5', 'single', 'x', 'Extended'),
    ('6', 'single', 'sr', 'Sunroom'),
    ('7', 'single', 'pw', 'Post Wrap'),
    ('8', 'single', 'tc', 'Tall Crawl'),
    ('9', 'single', '9t', '9'' Tall Walls'),
    ('10', 'two-digit', '10t', '10'' Tall Walls'),
    ('11', 'two-digit', 'ec', 'Enhanced Corners'),
    ('12', 'two-digit', 'er', 'Enhanced Rear'),
    ('13', 'two-digit', 'fw', 'Faux Wood'),
    ('14', 'two-digit', 'ma, m', 'Masonry'),
    ('15', 'two-digit', 'pr', 'Porch Rail'),
    ('18', 'two-digit', 's', 'Exterior Stair'),
    ('19', 'two-digit', 'hw', 'Housewrap Options')
ON CONFLICT (suffix_code) DO NOTHING;

-- ============================================================
-- SEED: PHASE CODES (53 codes with Fluid Format)
-- ============================================================

INSERT INTO phase_codes (phase_code, phase_name, legacy_pack, category, trade_code, unified_item_type, shipping_order, format_pattern) VALUES
    ('010.000', 'Foundation', '|10', 'Foundation', '4085', '1000', 1, 'base'),
    ('010.008', 'Foundation Tall Crawl', '|10tc', 'Foundation', '4085', '1000', 2, '.00S (S=8 tc)'),
    ('010.600', 'Extended Great Room', '|10.60', 'Foundation', '4085', '1000', 3, '.XX0 (XX=60)'),
    ('010.820', 'Optional Den', '|10.82', 'Foundation', '4085', '1000', 4, '.XX0 (XX=82)'),
    ('010.821', 'Optional Den + ReadyFrame', '|10.82rf', 'Foundation', '4085', '1000', 5, '.XXS (XX=82, S=1 rf)'),
    ('012.000', '3rd Car Garage Foundation', '|12', 'Garage', '4085', '1000', 10, 'base'),
    ('012.040', '2 Car 4'' Extension', '|12.04', 'Garage', '4085', '1000', 11, '.XX0 (XX=04)'),
    ('013.000', 'Covered Patio Foundation', '|13', 'Patio', '4085', '1000', 15, 'base'),
    ('013.100', 'Covered Patio Elev A', '|13.10', 'Patio', '4085', '1000', 16, '.XX0 (XX=10)'),
    ('013.200', 'Covered Patio 2', '|13.20', 'Patio', '4085', '1000', 17, '.XX0 (XX=20)'),
    ('013.207', 'Covered Patio 2 + Post Wrap', '|13.20pw', 'Patio', '4085', '1000', 18, '.XXS (XX=20, S=7 pw)'),
    ('014.000', 'Deck Foundation', '|14', 'Deck', '4085', '1000', 20, 'base'),
    ('018.000', 'Main Subfloor/Decking', '|18', 'Subfloor', '4085', '1000', 25, 'base'),
    ('020.000', 'Main Walls', '|20', 'Wall Framing', '4085', '1000', 30, 'base'),
    ('020.001', 'Main Walls ReadyFrame', '|20rf', 'Wall Framing', '4085', '1000', 31, '.00S (S=1 rf)'),
    ('020.014', 'Main Walls Masonry', '|20m', 'Wall Framing', '4085', '1000', 32, '.0ZZ (ZZ=14 ma)'),
    ('020.290', 'Bedroom w/ Bath', '|20.29', 'Wall Framing', '4085', '1000', 33, '.XX0 (XX=29)'),
    ('022.000', '3rd Car Garage Walls', '|22', 'Wall Framing', '4085', '1000', 35, 'base'),
    ('023.000', 'Covered Patio Framing', '|23', 'Wall Framing', '4085', '1000', 36, 'base'),
    ('023.100', 'Covered Patio Framing Elev A', '|23.10', 'Wall Framing', '4085', '1000', 37, '.XX0 (XX=10)'),
    ('024.000', 'Deck Framing', '|24', 'Wall Framing', '4085', '1000', 38, 'base'),
    ('030.000', '2nd Floor System', '|30', '2nd Floor', '4085', '1000', 40, 'base'),
    ('032.000', '2nd Floor Subfloor', '|32', '2nd Floor', '4085', '1000', 41, 'base'),
    ('034.000', '2nd Floor Walls', '|34', '2nd Floor', '4085', '1000', 42, 'base'),
    ('034.001', '2nd Floor Walls ReadyFrame', '|34rf', '2nd Floor', '4085', '1000', 43, '.00S (S=1 rf)'),
    ('034.003', '2nd Floor Walls Loft', '|34lo', '2nd Floor', '4085', '1000', 44, '.00S (S=3 lo)'),
    ('034.004', '2nd Floor Walls No Loft', '|34nl', '2nd Floor', '4085', '1000', 45, '.00S (S=4 nl)'),
    ('034.240', 'Bedroom 4', '|34.24', '2nd Floor', '4085', '1000', 46, '.XX0 (XX=24)'),
    ('034.610', 'Loft → Bedroom', '|34.61', '2nd Floor', '4085', '1000', 47, '.XX0 (XX=61)'),
    ('034.613', 'Loft → Bedroom + Loft variant', '|34.61lo', '2nd Floor', '4085', '1000', 48, '.XXS (XX=61, S=3 lo)'),
    ('034.800', 'Retreat', '|34.80', '2nd Floor', '4085', '1000', 49, '.XX0 (XX=80)'),
    ('040.000', 'Roof', '|40', 'Roof', '4085', '1000', 50, 'base'),
    ('040.010', 'Gable Sheeting', '|40gs', 'Roof', '4085', '1000', 51, '.XX0 (XX=01)'),
    ('042.000', '3rd Car Garage Roof', '|42', 'Roof', '4085', '1000', 52, 'base'),
    ('043.000', 'Covered Patio Roof', '|43', 'Roof', '4085', '1000', 53, 'base'),
    ('044.000', 'Deck Roof', '|44', 'Roof', '4085', '1000', 54, 'base'),
    ('058.000', 'Housewrap', '|58', 'Exterior', '4155', '2100', 60, 'base'),
    ('058.019', 'Housewrap Options', '|58hw', 'Exterior', '4155', '2100', 61, '.0ZZ (ZZ=19 hw)'),
    ('060.000', 'Exterior Siding', '|60', 'Siding', '4155', '2100', 65, 'base'),
    ('060.007', 'Exterior Post Wrap', '|60pw', 'Siding', '4155', '2100', 66, '.00S (S=7 pw)'),
    ('060.011', 'Enhanced Corners', '|60ec', 'Siding', '4155', '2100', 67, '.0ZZ (ZZ=11 ec)'),
    ('060.012', 'Enhanced Rear', '|60er', 'Siding', '4155', '2100', 68, '.0ZZ (ZZ=12 er)'),
    ('060.013', 'Faux Wood', '|60fw', 'Siding', '4155', '2100', 69, '.0ZZ (ZZ=13 fw)'),
    ('060.014', 'Masonry Siding', '|60m', 'Siding', '4155', '2100', 70, '.0ZZ (ZZ=14 ma)'),
    ('060.050', 'Enhanced Elevation B', '|60.05', 'Siding', '4155', '2100', 71, '.XX0 (XX=05)'),
    ('060.100', 'Enhanced Elevation C', '|60.10', 'Siding', '4155', '2100', 72, '.XX0 (XX=10)'),
    ('060.150', 'Enhanced Elevation D', '|60.15', 'Siding', '4155', '2100', 73, '.XX0 (XX=15)'),
    ('062.000', '3rd Car Garage Siding', '|62', 'Siding', '4155', '2100', 75, 'base'),
    ('063.000', 'Covered Patio Siding', '|63', 'Siding', '4155', '2100', 76, 'base'),
    ('063.007', 'Covered Patio Siding + Post Wrap', '|63pw', 'Siding', '4155', '2100', 77, '.00S (S=7 pw)'),
    ('074.000', 'Deck Surface', '|74', 'Deck', '4155', '2100', 80, 'base'),
    ('074.018', 'Exterior Stair Material', '|74s', 'Deck', '4155', '2100', 81, '.0ZZ (ZZ=18 s)'),
    ('075.000', 'Deck Rail', '|75', 'Deck', '4155', '2100', 82, 'base')
ON CONFLICT (phase_code) DO NOTHING;

-- ============================================================
-- SEED: ELEVATION MAPPING
-- ============================================================

INSERT INTO elevation_mapping (letter, digit, description) VALUES
    ('A', '1', 'Elevation A'), ('B', '2', 'Elevation B'),
    ('C', '3', 'Elevation C'), ('D', '4', 'Elevation D'),
    ('E', '5', 'Elevation E'), ('F', '6', 'Elevation F'),
    ('G', '7', 'Elevation G'), ('H', '8', 'Elevation H'),
    ('J', '9', 'Elevation J'), ('K', '10', 'Elevation K'),
    ('**', 'ALL', 'All Elevations / Universal')
ON CONFLICT (letter) DO NOTHING;

-- ============================================================
-- SEED: BUILDERS
-- ============================================================

INSERT INTO builders (builder_code, builder_name) VALUES
    ('RICHMOND', 'Richmond American Homes'),
    ('HOLT', 'Holt Homes'),
    ('SEKISUI', 'Sekisui House'),
    ('MANOR', 'Manor HSR')
ON CONFLICT (builder_code) DO NOTHING;

-- ============================================================
-- SEED: MATERIALS (First 50 of 516)
-- ============================================================

INSERT INTO materials (sku, bfs_description, rah_item_number, unified_item_type, holt_cost_code, category, unit_of_measure, unit_cost) VALUES
    ('1218RCF', '12"X18" FLUSH WOOD VENT CEDAR', 'R44204393', '1000', '4085', 'Accessories', 'EA', 44.22),
    ('1824RGV', '18X24 RECTANGLE GABLE VENT', 'R44204377', '1000', '4085', 'Accessories', 'EA', 70.78),
    ('24SBB', '2X4 22-7/16 SOLID BIRD BLOCK', NULL, '1000', '4085', 'Accessories', 'BOM', NULL),
    ('26SBB', '2X6 22-7/16 SOLID BIRD BLOCK', NULL, '1000', '4085', 'Accessories', 'BOM', NULL),
    ('512BIBBLK', '1X5-1/2"X5-1/2" BIB BLOCK', 'R44211407', '1000', '4085', 'Accessories', 'EA', 7.69),
    ('BE1824GVRPNT', '030 PAINT 18X24 GABLE VENT REC', 'R44204391', '1000', '4085', 'Accessories', 'EA', 67.99),
    ('GVPVE18X3001FUN', 'Rectangle Fixed Louver Gable Vent, 18"W x 30"H RO', NULL, '1000', '4085', 'Accessories', 'EA', NULL),
    ('HU559408', '8X16 FNDTN VENT PLASTIC 559408', 'R44204387', '1000', '4085', 'Accessories', 'EA', 12.4),
    ('MA00451218030', '030 PAINTABLE 12X18 GABLEVENT', 'R44204400', '1000', '4085', 'Accessories', 'EA', 60.34),
    ('MA00451824030', '18"X24" GABLE VENT PAINTABLE', NULL, '1000', '4085', 'Accessories', 'EA', NULL),
    ('PPG2212ISC', '1.5"X1.5"-12''INSIDE CORNER', 'R44204376', '1000', '4085', 'Accessories', 'EA', 21.76),
    ('PPG3069558', '1X7.25X11.25 LRG LT BLOCK W/FL', NULL, '1000', '4085', 'Accessories', 'EA', NULL),
    ('PPG725MLBR', '7.25"X9.25"LIGHT BLOCK RUSTIC', 'R44204384', '1000', '4085', 'Accessories', 'EA', 11.76),
    ('PPGPPR325SWF', '5.5"X7.5"R&R SPLT MNT W/FLSH R', 'R44204392', '1000', '4085', 'Accessories', 'EA', 14.7),
    ('PPGPPR334B1WF', '5.5"X5.5"N/C BIB BLCK W/FLSH R', 'R44204385', '1000', '4085', 'Accessories', 'EA', 8.51),
    ('PPGPR100BB', '5.5"X7.5"R&R SPLT MOUNT BIB RS', NULL, '1000', '4085', 'Accessories', 'EA', NULL),
    ('PPGPR103VB', '7.25"X9.25" R&R VENT BLOCK RUS', NULL, '1000', '4085', 'Accessories', 'EA', NULL),
    ('PPGPS104BB', '5.5"X7.5"R&R SPLT MOUNT BIB SM', 'R44204403', '1000', '4085', 'Accessories', 'EA', 11.76),
    ('DPWS', '10.3 OZ TUBE DUPONT SEALANT', 'R44204390', '1000', '4085', 'Adhesives', 'TUBE', 4.96),
    ('MD71550', 'CAULK BACKER ROD 3/8" X 350''', 'R44211383', '1000', '4085', 'Adhesives', 'EA', 46.99),
    ('SFG', 'BFS SUB FLR GLUE 28OZ', 'R44203299', '1000', '4085', 'Adhesives', 'BF', 4.08),
    ('TX1WHT10', 'TX1 TEXT POLY SEALANT WHT 10OZ', 'R44400085', '1000', '4085', 'Adhesives', 'EA', 5.66),
    ('A34', 'SIMPSON A34 FRAMNG ANCHOR', 'R44400094', '1000', '4085', 'Hardware', 'EA', 0.49),
    ('A34Z', 'A34 FRAMING ANCHOR Z-MAX', 'R44400001', '1000', '4085', 'Hardware', 'EA', 0.79),
    ('A35', '1-7/16X4-1/2" FRAMING ANCHOR', 'R44400095', '1000', '4085', 'Hardware', 'EA', 0.53),
    ('A35Z', 'A35 FRAMING ANCHOR Z-MAX', 'R44400206', '1000', '4085', 'Hardware', 'EA', 0.59),
    ('ABU44Z', 'ABU44 4X4 ADJ. POST Z-MAX', 'R44400098', '1000', '4085', 'Hardware', 'EA', 19.46),
    ('ABU46Z', 'ABU46 4X6 ADJ. POST Z-MAX', 'R44400121', '1000', '4085', 'Hardware', 'EA', 34.73),
    ('ABU66Z', 'ABU66 6X6 ADJ. POST Z-MAX', 'R44400105', '1000', '4085', 'Hardware', 'EA', 41.35),
    ('ABU88Z', 'ABU88 8X8 ADJ. POST Z-MAX', 'R44400148', '1000', '4085', 'Hardware', 'EA', 80.17),
    ('ARS28RA', 'ARS28 "SUPER ANCHOR" ROOF', 'R44400209', '1000', '4085', 'Hardware', 'EA', 65.49),
    ('CH38SP', '3/8" STINGER STAPLE PAC 2016CT', 'R44204404', '1000', '4085', 'Hardware', 'EA', 56.64),
    ('CMST14', 'COILED STRAP 14GA', 'R44400291', '1000', '4085', 'Hardware', 'EA', 190.46),
    ('CMSTC16', 'COILED STRAP 16GA', 'R44400109', '1000', '4085', 'Hardware', 'EA', 202.08),
    ('CS14-R', 'COILED STRAP 14GA 25''', NULL, '1000', '4085', 'Hardware', 'EA', NULL),
    ('CS16', 'COILED STRAP 150''', 'R44400204', '1000', '4085', 'Hardware', 'EA', 151.03),
    ('CS16-R', 'COILED STRAP 16GA 25''', 'R44400100', '1000', '4085', 'Hardware', 'EA', 45.35),
    ('CS20', 'SIMPSON CS20 11/4 250COILSTRAP', 'R44400202', '1000', '4085', 'Hardware', 'EA', 153.72),
    ('CS20-R', 'COILED STRAP 20GA 25'' SIMPSON', 'R44400101', '1000', '4085', 'Hardware', 'EA', 34.5),
    ('CS22-R', 'COILED STRAP 22GA 25''', NULL, '1000', '4085', 'Hardware', 'EA', NULL),
    ('DTT2Z', 'DECK TENSION TIE HOLDDOWNZ-MAX', 'R44400139', '1000', '4085', 'Hardware', 'EA', 10.85),
    ('GRAGGIFC29', 'GrabberGard IFC Intumescent Fire
Caulk - 29 oz', 'R44211395', '1000', '4085', 'Hardware', 'EA', 25.33),
    ('GRAGSCSF', 'Grabber GSCS Acoustical Sealant', 'R44211396', '1000', '4085', 'Hardware', 'EA', 9.43),
    ('GRAVB31Z', '9/16 in x #8 Grabber #2 Phillips 5# Bx - Wafer Head Fine Thread', 'R44211393', '1000', '4085', 'Hardware', 'BOX', 32.4),
    ('GRC7R90DHG', 'GRIP RITE 2 3/16X.92 HDG SIDNG', NULL, '1000', '4085', 'Hardware', 'EA', NULL),
    ('GRC7R92HG1', '2-3/16"X.092 WIRE HDG RNG 1.2M', NULL, '1000', '4085', 'Hardware', 'BOX', NULL),
    ('GRF162M', '2" 16GA FINISH NAIL GALV 1M', NULL, '1000', '4085', 'Hardware', 'BOX', NULL),
    ('HDU11-SDS2.5', 'HDU11-SDS2.5 HOLDDOWN', NULL, '1000', '4085', 'Hardware', 'EA', NULL),
    ('HDU14-SDS2.5', '25-11/16" PREDEFLECTED HOLDOWN', NULL, '1000', '4085', 'Hardware', 'EA', NULL),
    ('HDU2-SDS2.5', '8-11/16" PREDEFLECTED HOLDOWN', NULL, '1000', '4085', 'Hardware', 'EA', NULL)
ON CONFLICT (sku) DO UPDATE SET
    unified_item_type = EXCLUDED.unified_item_type,
    holt_cost_code = EXCLUDED.holt_cost_code,
    updated_at = CURRENT_TIMESTAMP;