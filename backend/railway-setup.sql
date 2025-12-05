-- Railway PostgreSQL Setup (No PostGIS)
-- Copy and paste this entire file into Railway's Query tab

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    for_sale BOOLEAN DEFAULT TRUE,
    date_listed DATE,
    days_on_market INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'For Sale',
    price DECIMAL(12, 2) NOT NULL,
    price_per_square_foot DECIMAL(10, 2),
    square_foot INTEGER NOT NULL,
    bed INTEGER NOT NULL,
    bath DECIMAL(3, 1) NOT NULL,
    lot_size INTEGER,
    hoa DECIMAL(10, 2) DEFAULT 0,
    home_type VARCHAR(50) NOT NULL,
    home_design VARCHAR(50),
    estimated_taxes DECIMAL(10, 2),
    year_built INTEGER,
    number_of_units INTEGER DEFAULT 1,
    last_sold_date DATE,
    last_sold_amount DECIMAL(12, 2),
    estimated_monthly_rent DECIMAL(10, 2),
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties (city, state);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);

-- Sample data (10 properties for quick test)
INSERT INTO properties (address, street, city, state, zip, latitude, longitude, for_sale, date_listed, status, price, square_foot, bed, bath, lot_size, hoa, home_type, home_design, estimated_taxes, year_built, number_of_units, estimated_monthly_rent) VALUES
('1500 Main St, Dallas, TX 75201', '1500 Main St', 'Dallas', 'TX', '75201', 32.7825, -96.7985, true, '2024-10-15', 'For Sale', 425000, 1850, 3, 2.5, 4500, 250, 'Townhouse', 'Modern', 8500, 2018, 1, 2800),
('2200 Ross Ave, Dallas, TX 75201', '2200 Ross Ave', 'Dallas', 'TX', '75201', 32.7872, -96.7923, true, '2024-09-20', 'Price Reduced', 550000, 2200, 4, 3, 6000, 300, 'Single Family', 'Contemporary', 11000, 2015, 1, 3500),
('1234 Gaston Ave, Dallas, TX 75214', '1234 Gaston Ave', 'Dallas', 'TX', '75214', 32.7925, -96.7650, true, '2024-06-15', 'Price Reduced', 195000, 1100, 2, 1, 5500, 0, 'Single Family', 'Ranch', 3900, 1955, 1, 1500),
('3200 S Lamar St, Dallas, TX 75215', '3200 S Lamar St', 'Dallas', 'TX', '75215', 32.7520, -96.7825, true, '2024-04-01', 'Foreclosure', 125000, 1400, 3, 2, 7000, 0, 'Single Family', 'Ranch', 2500, 1962, 1, 1200),
('300 Bowie St, Austin, TX 78703', '300 Bowie St', 'Austin', 'TX', '78703', 30.2685, -97.7525, true, '2024-10-01', 'For Sale', 595000, 1800, 2, 2, 0, 450, 'Condo', 'Modern', 11900, 2020, 1, 3200),
('2100 E Cesar Chavez St, Austin, TX 78702', '2100 E Cesar Chavez St', 'Austin', 'TX', '78702', 30.2565, -97.7225, true, '2024-08-20', 'Price Reduced', 485000, 1600, 3, 2, 5500, 0, 'Single Family', 'Modern Farmhouse', 9700, 2021, 1, 2900),
('200 E Houston St, San Antonio, TX 78205', '200 E Houston St', 'San Antonio', 'TX', '78205', 29.4252, -98.4875, true, '2024-09-01', 'For Sale', 385000, 1400, 2, 2, 0, 350, 'Condo', 'Modern', 7700, 2018, 1, 2200),
('1500 N Central Ave, Phoenix, AZ 85004', '1500 N Central Ave', 'Phoenix', 'AZ', '85004', 33.4625, -112.0745, true, '2024-09-25', 'For Sale', 425000, 1600, 2, 2, 0, 300, 'Condo', 'Modern', 4250, 2019, 1, 2400),
('950 W Peachtree St, Atlanta, GA 30309', '950 W Peachtree St', 'Atlanta', 'GA', '30309', 33.7825, -84.3925, true, '2024-10-01', 'For Sale', 485000, 1500, 2, 2, 0, 450, 'Condo', 'Modern', 5820, 2020, 1, 2800),
('1200 Fatherland St, Nashville, TN 37206', '1200 Fatherland St', 'Nashville', 'TN', '37206', 36.1725, -86.7525, true, '2024-09-15', 'For Sale', 485000, 1700, 3, 2.5, 5000, 0, 'Single Family', 'Modern', 4850, 2018, 1, 2900);

-- Update price per sqft
UPDATE properties SET price_per_square_foot = price / square_foot WHERE square_foot > 0;
UPDATE properties SET days_on_market = CURRENT_DATE - date_listed WHERE date_listed IS NOT NULL;
