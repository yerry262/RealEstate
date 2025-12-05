-- Deal Finder Database Initialization
-- This script runs automatically on first database start

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Properties table with all required columns
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    
    -- Address fields (as specified)
    address VARCHAR(500) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    
    -- Geospatial (for map display)
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOMETRY(POINT, 4326),
    
    -- Listing info
    for_sale BOOLEAN DEFAULT TRUE,
    date_listed DATE,
    days_on_market INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'For Sale',
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    price_per_square_foot DECIMAL(10, 2),
    
    -- Property details
    square_foot INTEGER NOT NULL,
    bed INTEGER NOT NULL,
    bath DECIMAL(3, 1) NOT NULL,
    lot_size INTEGER,
    hoa DECIMAL(10, 2) DEFAULT 0,
    
    -- Property characteristics
    home_type VARCHAR(50) NOT NULL,
    home_design VARCHAR(50),
    estimated_taxes DECIMAL(10, 2),
    year_built INTEGER,
    number_of_units INTEGER DEFAULT 1,
    
    -- History
    last_sold_date DATE,
    last_sold_amount DECIMAL(12, 2),
    
    -- Calculated fields
    estimated_monthly_rent DECIMAL(10, 2),
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for fast map queries
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (location);

-- Create indexes for common filters
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties (city, state);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_home_type ON properties (home_type);
CREATE INDEX IF NOT EXISTS idx_properties_for_sale ON properties (for_sale);

-- Trigger to auto-update location geometry from lat/lng
CREATE OR REPLACE FUNCTION update_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location ON properties;
CREATE TRIGGER trigger_update_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON properties
FOR EACH ROW
EXECUTE FUNCTION update_location_geometry();

-- Trigger to calculate price per sqft
CREATE OR REPLACE FUNCTION update_price_per_sqft()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.square_foot > 0 THEN
        NEW.price_per_square_foot := NEW.price / NEW.square_foot;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_price_per_sqft ON properties;
CREATE TRIGGER trigger_update_price_per_sqft
BEFORE INSERT OR UPDATE OF price, square_foot ON properties
FOR EACH ROW
EXECUTE FUNCTION update_price_per_sqft();

-- Trigger to update days_on_market
CREATE OR REPLACE FUNCTION update_days_on_market()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_listed IS NOT NULL THEN
        NEW.days_on_market := CURRENT_DATE - NEW.date_listed;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_days_on_market ON properties;
CREATE TRIGGER trigger_update_days_on_market
BEFORE INSERT OR UPDATE OF date_listed ON properties
FOR EACH ROW
EXECUTE FUNCTION update_days_on_market();

-- Schema creation complete
DO $$ BEGIN RAISE NOTICE 'Database schema created successfully!'; END $$;
