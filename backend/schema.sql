-- Deal Finder Database Schema
-- PostgreSQL with PostGIS

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    
    -- Address fields
    address VARCHAR(500) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    
    -- Geospatial
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOMETRY(POINT, 4326),
    
    -- Listing info
    for_sale BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'For Sale',
    date_listed DATE,
    days_on_market INTEGER DEFAULT 0,
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    
    -- Property details
    sqft INTEGER NOT NULL,
    beds INTEGER NOT NULL,
    baths DECIMAL(3, 1) NOT NULL,
    lot_size INTEGER,
    hoa DECIMAL(10, 2) DEFAULT 0,
    
    -- Property characteristics
    home_type VARCHAR(50) NOT NULL,
    home_design VARCHAR(50),
    estimated_taxes DECIMAL(10, 2),
    year_built INTEGER,
    units INTEGER DEFAULT 1,
    
    -- History
    last_sold_date DATE,
    last_sold_amount DECIMAL(12, 2),
    
    -- Calculated/Estimated fields
    estimated_monthly_rent DECIMAL(10, 2),
    
    -- Metadata
    source VARCHAR(50), -- 'MLS', 'off-market', 'wholesaler', 'foreclosure', 'fsbo'
    source_id VARCHAR(100), -- External ID from source
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_state CHECK (state ~ '^[A-Z]{2}$'),
    CONSTRAINT positive_price CHECK (price > 0),
    CONSTRAINT valid_beds CHECK (beds >= 0),
    CONSTRAINT valid_baths CHECK (baths >= 0)
);

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (location);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties (city, state);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_home_type ON properties (home_type);
CREATE INDEX IF NOT EXISTS idx_properties_days_on_market ON properties (days_on_market);

-- Trigger to auto-update location geometry from lat/lng
CREATE OR REPLACE FUNCTION update_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON properties
FOR EACH ROW
EXECUTE FUNCTION update_location_geometry();

-- Trigger to calculate price per sqft
CREATE OR REPLACE FUNCTION update_price_per_sqft()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sqft > 0 THEN
        NEW.price_per_sqft := NEW.price / NEW.sqft;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_price_per_sqft
BEFORE INSERT OR UPDATE OF price, sqft ON properties
FOR EACH ROW
EXECUTE FUNCTION update_price_per_sqft();

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- For future user system
    name VARCHAR(100) NOT NULL,
    
    -- Search criteria
    bbox_north DECIMAL(10, 8),
    bbox_south DECIMAL(10, 8),
    bbox_east DECIMAL(11, 8),
    bbox_west DECIMAL(11, 8),
    
    status_filter VARCHAR(50),
    home_type_filter VARCHAR(50),
    min_price DECIMAL(12, 2),
    max_price DECIMAL(12, 2),
    min_beds INTEGER,
    min_deal_score INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- Saved properties (favorites)
CREATE TABLE IF NOT EXISTS saved_properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- For future user system
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, property_id)
);

-- Property analysis snapshots
-- Stores analysis results at a point in time
CREATE TABLE IF NOT EXISTS analysis_snapshots (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Assumptions used
    down_payment_percent DECIMAL(5, 4),
    interest_rate DECIMAL(5, 4),
    loan_term_years INTEGER,
    estimated_rent DECIMAL(10, 2),
    
    -- Results
    deal_score INTEGER,
    cap_rate DECIMAL(5, 4),
    cash_on_cash DECIMAL(5, 4),
    monthly_cash_flow DECIMAL(10, 2),
    annual_cash_flow DECIMAL(10, 2),
    dscr DECIMAL(5, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analysis_property ON analysis_snapshots (property_id);
CREATE INDEX IF NOT EXISTS idx_analysis_deal_score ON analysis_snapshots (deal_score);

-- ============ SAMPLE QUERIES ============

-- Find properties within a bounding box
-- SELECT * FROM properties 
-- WHERE location && ST_MakeEnvelope(-97.8, 30.2, -97.6, 30.4, 4326);

-- Find properties within radius of a point (in meters)
-- SELECT * FROM properties 
-- WHERE ST_DWithin(
--     location::geography, 
--     ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography, 
--     5000  -- 5km radius
-- );

-- Get aggregated stats by area for heatmap
-- WITH grid AS (
--     SELECT ST_SnapToGrid(location, 0.01) AS cell
--     FROM properties
-- )
-- SELECT 
--     ST_X(cell) as lng, 
--     ST_Y(cell) as lat,
--     COUNT(*) as property_count,
--     AVG(deal_score) as avg_deal_score
-- FROM grid
-- GROUP BY cell;

-- ============ VIEWS ============

-- View with calculated fields for easy querying
CREATE OR REPLACE VIEW properties_with_analysis AS
SELECT 
    p.*,
    -- Rent-to-price ratio (1% rule)
    CASE WHEN p.price > 0 THEN p.estimated_monthly_rent / p.price ELSE 0 END as rent_to_price,
    -- Basic cap rate estimate (simplified)
    CASE WHEN p.price > 0 THEN 
        ((p.estimated_monthly_rent * 12 * 0.5) / p.price) 
    ELSE 0 END as estimated_cap_rate
FROM properties p;
