-- Test Data for Deal Finder
-- Real addresses with accurate coordinates for map display

-- ============ DALLAS, TX AREA ============
INSERT INTO properties (
    address, street, city, state, zip, latitude, longitude,
    for_sale, date_listed, status, price, square_foot, bed, bath,
    lot_size, hoa, home_type, home_design, estimated_taxes, year_built,
    number_of_units, last_sold_date, last_sold_amount, estimated_monthly_rent
) VALUES
-- Downtown Dallas
('1500 Main St, Dallas, TX 75201', '1500 Main St', 'Dallas', 'TX', '75201',
 32.7825, -96.7985, true, '2024-10-15', 'For Sale',
 425000, 1850, 3, 2.5, 4500, 250, 'Townhouse', 'Modern', 8500, 2018,
 1, '2020-05-12', 380000, 2800),

('2200 Ross Ave, Dallas, TX 75201', '2200 Ross Ave', 'Dallas', 'TX', '75201',
 32.7872, -96.7923, true, '2024-09-20', 'Price Reduced',
 550000, 2200, 4, 3, 6000, 300, 'Single Family', 'Contemporary', 11000, 2015,
 1, '2019-08-22', 475000, 3500),

-- Deep Ellum
('2800 Main St, Dallas, TX 75226', '2800 Main St', 'Dallas', 'TX', '75226',
 32.7835, -96.7810, true, '2024-11-01', 'New Listing',
 285000, 1200, 2, 2, 2500, 150, 'Condo', 'Industrial Loft', 5700, 2005,
 1, '2021-03-15', 245000, 1900),

-- Oak Lawn
('4100 Lemmon Ave, Dallas, TX 75219', '4100 Lemmon Ave', 'Dallas', 'TX', '75219',
 32.8102, -96.8125, true, '2024-08-10', 'For Sale',
 675000, 2800, 4, 3.5, 8500, 0, 'Single Family', 'Colonial', 13500, 1985,
 1, '2017-11-30', 520000, 4200),

-- Highland Park (expensive area)
('4500 Beverly Dr, Dallas, TX 75205', '4500 Beverly Dr', 'Dallas', 'TX', '75205',
 32.8315, -96.7985, true, '2024-07-25', 'For Sale',
 1250000, 4200, 5, 4.5, 12000, 0, 'Single Family', 'Mediterranean', 25000, 1995,
 1, '2015-06-18', 890000, 6500),

-- East Dallas - Good Deals Area
('1234 Gaston Ave, Dallas, TX 75214', '1234 Gaston Ave', 'Dallas', 'TX', '75214',
 32.7925, -96.7650, true, '2024-06-15', 'Price Reduced',
 195000, 1100, 2, 1, 5500, 0, 'Single Family', 'Ranch', 3900, 1955,
 1, '2022-01-10', 165000, 1500),

('1456 Swiss Ave, Dallas, TX 75204', '1456 Swiss Ave', 'Dallas', 'TX', '75204',
 32.7885, -96.7720, true, '2024-05-20', 'For Sale',
 225000, 1350, 3, 2, 6200, 0, 'Single Family', 'Craftsman', 4500, 1948,
 1, '2020-09-05', 185000, 1750),

-- South Dallas - Investor Opportunities
('3200 S Lamar St, Dallas, TX 75215', '3200 S Lamar St', 'Dallas', 'TX', '75215',
 32.7520, -96.7825, true, '2024-04-01', 'Foreclosure',
 125000, 1400, 3, 2, 7000, 0, 'Single Family', 'Ranch', 2500, 1962,
 1, '2018-12-01', 95000, 1200),

('2850 Al Lipscomb Way, Dallas, TX 75215', '2850 Al Lipscomb Way', 'Dallas', 'TX', '75215',
 32.7485, -96.7680, true, '2024-03-15', 'Off-Market',
 145000, 1600, 4, 2, 8000, 0, 'Duplex', 'Traditional', 2900, 1958,
 2, '2019-07-20', 110000, 1800),

-- Pleasant Grove
('1850 Masters Dr, Dallas, TX 75217', '1850 Masters Dr', 'Dallas', 'TX', '75217',
 32.7365, -96.7125, true, '2024-11-10', 'New Listing',
 185000, 1550, 3, 2, 6500, 0, 'Single Family', 'Traditional', 3700, 1978,
 1, '2021-05-15', 155000, 1450),

-- ============ AUSTIN, TX AREA ============
-- Downtown Austin
('300 Bowie St, Austin, TX 78703', '300 Bowie St', 'Austin', 'TX', '78703',
 30.2685, -97.7525, true, '2024-10-01', 'For Sale',
 595000, 1800, 2, 2, 0, 450, 'Condo', 'Modern', 11900, 2020,
 1, '2021-08-10', 525000, 3200),

('1100 Congress Ave, Austin, TX 78701', '1100 Congress Ave', 'Austin', 'TX', '78701',
 30.2720, -97.7432, true, '2024-09-15', 'For Sale',
 725000, 2100, 3, 2.5, 0, 550, 'Condo', 'Contemporary', 14500, 2019,
 1, '2020-12-01', 650000, 4000),

-- East Austin - Hot Area
('2100 E Cesar Chavez St, Austin, TX 78702', '2100 E Cesar Chavez St', 'Austin', 'TX', '78702',
 30.2565, -97.7225, true, '2024-08-20', 'Price Reduced',
 485000, 1600, 3, 2, 5500, 0, 'Single Family', 'Modern Farmhouse', 9700, 2021,
 1, '2022-03-15', 450000, 2900),

('1800 E 12th St, Austin, TX 78702', '1800 E 12th St', 'Austin', 'TX', '78702',
 30.2745, -97.7185, true, '2024-07-10', 'For Sale',
 395000, 1200, 2, 2, 4000, 0, 'Single Family', 'Craftsman', 7900, 1945,
 1, '2019-11-20', 285000, 2400),

-- South Austin
('2500 S Lamar Blvd, Austin, TX 78704', '2500 S Lamar Blvd', 'Austin', 'TX', '78704',
 30.2425, -97.7685, true, '2024-10-25', 'New Listing',
 525000, 1900, 3, 2.5, 6000, 0, 'Single Family', 'Contemporary', 10500, 2010,
 1, '2018-04-12', 425000, 3100),

-- North Austin - More Affordable
('8500 N Lamar Blvd, Austin, TX 78753', '8500 N Lamar Blvd', 'Austin', 'TX', '78753',
 30.3585, -97.7025, true, '2024-06-01', 'For Sale',
 295000, 1450, 3, 2, 5000, 125, 'Townhouse', 'Traditional', 5900, 2005,
 1, '2020-08-30', 255000, 1950),

('9200 Parkfield Dr, Austin, TX 78758', '9200 Parkfield Dr', 'Austin', 'TX', '78758',
 30.3725, -97.7125, true, '2024-05-15', 'Price Reduced',
 265000, 1350, 3, 2, 4500, 100, 'Townhouse', 'Modern', 5300, 2008,
 1, '2021-02-28', 235000, 1800),

-- Round Rock (suburb)
('1500 Hairy Man Rd, Round Rock, TX 78681', '1500 Hairy Man Rd', 'Round Rock', 'TX', '78681',
 30.5285, -97.6825, true, '2024-11-05', 'New Listing',
 385000, 2200, 4, 2.5, 7500, 50, 'Single Family', 'Traditional', 7700, 2015,
 1, '2019-09-10', 325000, 2400),

-- ============ SAN ANTONIO, TX AREA ============
-- Downtown/River Walk
('200 E Houston St, San Antonio, TX 78205', '200 E Houston St', 'San Antonio', 'TX', '78205',
 29.4252, -98.4875, true, '2024-09-01', 'For Sale',
 385000, 1400, 2, 2, 0, 350, 'Condo', 'Modern', 7700, 2018,
 1, '2020-06-15', 345000, 2200),

-- Alamo Heights
('350 Terrell Rd, San Antonio, TX 78209', '350 Terrell Rd', 'San Antonio', 'TX', '78209',
 29.4685, -98.4625, true, '2024-08-15', 'For Sale',
 595000, 2400, 4, 3, 9000, 0, 'Single Family', 'Spanish Colonial', 11900, 1965,
 1, '2017-03-20', 465000, 3500),

-- Southtown
('1200 S Alamo St, San Antonio, TX 78210', '1200 S Alamo St', 'San Antonio', 'TX', '78210',
 29.4125, -98.4925, true, '2024-10-20', 'New Listing',
 325000, 1350, 2, 2, 4500, 0, 'Single Family', 'Victorian', 6500, 1920,
 1, '2019-12-01', 275000, 2100),

-- Near West Side - Great Cash Flow
('2400 Culebra Rd, San Antonio, TX 78228', '2400 Culebra Rd', 'San Antonio', 'TX', '78228',
 29.4565, -98.5325, true, '2024-04-10', 'For Sale',
 165000, 1200, 3, 1.5, 6000, 0, 'Single Family', 'Ranch', 3300, 1958,
 1, '2020-10-15', 135000, 1350),

('3100 W Commerce St, San Antonio, TX 78207', '3100 W Commerce St', 'San Antonio', 'TX', '78207',
 29.4325, -98.5225, true, '2024-03-25', 'Foreclosure',
 115000, 1100, 3, 1, 5500, 0, 'Single Family', 'Traditional', 2300, 1952,
 1, '2018-08-10', 85000, 1100),

-- South San Antonio - Investor Area
('4500 S Flores St, San Antonio, TX 78214', '4500 S Flores St', 'San Antonio', 'TX', '78214',
 29.3785, -98.5025, true, '2024-02-15', 'Off-Market',
 135000, 1500, 4, 2, 7500, 0, 'Duplex', 'Traditional', 2700, 1960,
 2, '2019-05-20', 105000, 1600),

-- ============ HOUSTON, TX AREA ============
-- Montrose
('1900 Westheimer Rd, Houston, TX 77098', '1900 Westheimer Rd', 'Houston', 'TX', '77098',
 29.7425, -95.3985, true, '2024-09-10', 'For Sale',
 545000, 2000, 3, 2.5, 5000, 0, 'Single Family', 'Contemporary', 10900, 2012,
 1, '2019-04-15', 475000, 3200),

-- The Heights
('800 Yale St, Houston, TX 77007', '800 Yale St', 'Houston', 'TX', '77007',
 29.7925, -95.3985, true, '2024-10-05', 'New Listing',
 625000, 2300, 4, 3, 6000, 0, 'Single Family', 'Craftsman', 12500, 2016,
 1, '2020-07-20', 545000, 3800),

-- Third Ward - Value Area
('3200 Blodgett St, Houston, TX 77004', '3200 Blodgett St', 'Houston', 'TX', '77004',
 29.7225, -95.3625, true, '2024-05-01', 'Price Reduced',
 195000, 1300, 3, 2, 5500, 0, 'Single Family', 'Ranch', 3900, 1955,
 1, '2021-09-10', 165000, 1500),

-- Spring Branch
('2100 Blalock Rd, Houston, TX 77080', '2100 Blalock Rd', 'Houston', 'TX', '77080',
 29.8025, -95.5125, true, '2024-08-01', 'For Sale',
 285000, 1650, 3, 2, 7000, 0, 'Single Family', 'Traditional', 5700, 1975,
 1, '2020-02-28', 245000, 1900),

-- ============ PHOENIX, AZ AREA ============
-- Central Phoenix
('1500 N Central Ave, Phoenix, AZ 85004', '1500 N Central Ave', 'Phoenix', 'AZ', '85004',
 33.4625, -112.0745, true, '2024-09-25', 'For Sale',
 425000, 1600, 2, 2, 0, 300, 'Condo', 'Modern', 4250, 2019,
 1, '2021-04-10', 385000, 2400),

-- Arcadia
('4200 E Camelback Rd, Phoenix, AZ 85018', '4200 E Camelback Rd', 'Phoenix', 'AZ', '85018',
 33.5085, -111.9925, true, '2024-10-10', 'For Sale',
 785000, 2800, 4, 3, 10000, 0, 'Single Family', 'Spanish', 7850, 1985,
 1, '2018-11-15', 625000, 4200),

-- South Phoenix - Cash Flow
('3500 S Central Ave, Phoenix, AZ 85040', '3500 S Central Ave', 'Phoenix', 'AZ', '85040',
 33.4025, -112.0745, true, '2024-06-20', 'Price Reduced',
 225000, 1400, 3, 2, 6500, 0, 'Single Family', 'Ranch', 2250, 1965,
 1, '2020-08-05', 185000, 1650),

-- Mesa
('1800 W University Dr, Mesa, AZ 85201', '1800 W University Dr', 'Mesa', 'AZ', '85201',
 33.4225, -111.8625, true, '2024-07-15', 'For Sale',
 345000, 1800, 4, 2, 7000, 0, 'Single Family', 'Traditional', 3450, 1998,
 1, '2019-10-20', 295000, 2100),

-- ============ ATLANTA, GA AREA ============
-- Midtown
('950 W Peachtree St, Atlanta, GA 30309', '950 W Peachtree St', 'Atlanta', 'GA', '30309',
 33.7825, -84.3925, true, '2024-10-01', 'For Sale',
 485000, 1500, 2, 2, 0, 450, 'Condo', 'Modern', 5820, 2020,
 1, '2021-06-15', 445000, 2800),

-- East Atlanta
('1200 Flat Shoals Ave, Atlanta, GA 30316', '1200 Flat Shoals Ave', 'Atlanta', 'GA', '30316',
 33.7385, -84.3425, true, '2024-08-25', 'New Listing',
 365000, 1600, 3, 2, 5500, 0, 'Single Family', 'Craftsman', 4380, 1945,
 1, '2019-03-10', 285000, 2400),

-- West End - Investor Favorite
('850 Peeples St, Atlanta, GA 30310', '850 Peeples St', 'Atlanta', 'GA', '30310',
 33.7325, -84.4225, true, '2024-05-15', 'Off-Market',
 195000, 1200, 3, 1.5, 5000, 0, 'Single Family', 'Victorian', 2340, 1925,
 1, '2020-11-20', 155000, 1650),

-- College Park
('2100 Virginia Ave, College Park, GA 30337', '2100 Virginia Ave', 'College Park', 'GA', '30337',
 33.6485, -84.4525, true, '2024-04-01', 'Foreclosure',
 145000, 1350, 3, 2, 6000, 0, 'Single Family', 'Ranch', 1740, 1962,
 1, '2018-07-15', 115000, 1300),

-- ============ TAMPA, FL AREA ============
-- Downtown Tampa
('100 N Tampa St, Tampa, FL 33602', '100 N Tampa St', 'Tampa', 'FL', '33602',
 27.9485, -82.4585, true, '2024-09-20', 'For Sale',
 495000, 1400, 2, 2, 0, 500, 'Condo', 'Modern', 4950, 2021,
 1, '2022-01-10', 465000, 2800),

-- Seminole Heights
('1500 E Hillsborough Ave, Tampa, FL 33610', '1500 E Hillsborough Ave', 'Tampa', 'FL', '33610',
 27.9985, -82.4325, true, '2024-08-10', 'Price Reduced',
 345000, 1550, 3, 2, 6500, 0, 'Single Family', 'Craftsman', 3450, 1935,
 1, '2020-05-20', 285000, 2200),

-- West Tampa - Value
('2200 N Howard Ave, Tampa, FL 33607', '2200 N Howard Ave', 'Tampa', 'FL', '33607',
 27.9625, -82.4825, true, '2024-06-05', 'For Sale',
 275000, 1300, 3, 1.5, 5500, 0, 'Single Family', 'Traditional', 2750, 1952,
 1, '2019-09-15', 225000, 1800),

-- St. Petersburg
('300 Beach Dr NE, St. Petersburg, FL 33701', '300 Beach Dr NE', 'St. Petersburg', 'FL', '33701',
 27.7725, -82.6325, true, '2024-10-30', 'New Listing',
 585000, 1600, 2, 2, 0, 550, 'Condo', 'Contemporary', 5850, 2018,
 1, '2020-12-10', 525000, 3200),

-- ============ NASHVILLE, TN AREA ============
-- East Nashville
('1200 Fatherland St, Nashville, TN 37206', '1200 Fatherland St', 'Nashville', 'TN', '37206',
 36.1725, -86.7525, true, '2024-09-15', 'For Sale',
 485000, 1700, 3, 2.5, 5000, 0, 'Single Family', 'Modern', 4850, 2018,
 1, '2020-04-25', 425000, 2900),

-- The Nations
('800 51st Ave N, Nashville, TN 37209', '800 51st Ave N', 'Nashville', 'TN', '37209',
 36.1625, -86.8425, true, '2024-08-01', 'New Listing',
 545000, 1900, 3, 2.5, 4500, 0, 'Single Family', 'Modern Farmhouse', 5450, 2020,
 1, '2021-08-15', 495000, 3200),

-- Madison - Affordable
('800 Neelys Bend Rd, Madison, TN 37115', '800 Neelys Bend Rd', 'Madison', 'TN', '37115',
 36.2685, -86.7025, true, '2024-05-20', 'Price Reduced',
 265000, 1400, 3, 2, 6500, 0, 'Single Family', 'Ranch', 2650, 1972,
 1, '2020-01-15', 225000, 1750),

-- Antioch - Investor Area
('3200 Murfreesboro Pike, Antioch, TN 37013', '3200 Murfreesboro Pike', 'Antioch', 'TN', '37013',
 36.0585, -86.6525, true, '2024-04-10', 'For Sale',
 225000, 1250, 3, 2, 5500, 0, 'Single Family', 'Traditional', 2250, 1985,
 1, '2019-11-05', 185000, 1550);

-- Update statistics
ANALYZE properties;

-- Verify data
DO $$
DECLARE
    prop_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO prop_count FROM properties;
    RAISE NOTICE 'Inserted % properties successfully!', prop_count;
END $$;
