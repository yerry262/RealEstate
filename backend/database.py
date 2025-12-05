# Database connection module

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dealfinder:dealfinder123@localhost:5432/deal_finder")

# Connection pool
pool: asyncpg.Pool = None


async def init_db():
    """Initialize database connection pool"""
    global pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=2,
        max_size=10,
        command_timeout=60
    )
    print("✅ Database connection pool created")
    return pool


async def close_db():
    """Close database connection pool"""
    global pool
    if pool:
        await pool.close()
        print("Database connection pool closed")


@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Get a connection from the pool"""
    global pool
    if not pool:
        await init_db()
    
    async with pool.acquire() as connection:
        yield connection


async def fetch_properties_in_bbox(north: float, south: float, east: float, west: float, filters: dict = None):
    """
    Fetch properties within a bounding box using simple lat/lng comparison
    Works with or without PostGIS
    """
    async with get_connection() as conn:
        # Build query with filters - use simple lat/lng instead of PostGIS
        query = """
            SELECT 
                id, address, street, city, state, zip,
                latitude, longitude,
                for_sale, date_listed, days_on_market, status,
                price, price_per_square_foot,
                square_foot, bed, bath, lot_size, hoa,
                home_type, home_design, estimated_taxes, year_built,
                number_of_units, last_sold_date, last_sold_amount,
                estimated_monthly_rent
            FROM properties
            WHERE latitude BETWEEN $1 AND $2
              AND longitude BETWEEN $3 AND $4
        """
        params = [south, north, west, east]
        param_idx = 5
        
        # Apply filters
        if filters:
            if filters.get('status') and filters['status'] != 'All':
                query += f" AND status = ${param_idx}"
                params.append(filters['status'])
                param_idx += 1
            
            if filters.get('home_type') and filters['home_type'] != 'All':
                query += f" AND home_type = ${param_idx}"
                params.append(filters['home_type'])
                param_idx += 1
            
            if filters.get('min_price'):
                query += f" AND price >= ${param_idx}"
                params.append(filters['min_price'])
                param_idx += 1
            
            if filters.get('max_price'):
                query += f" AND price <= ${param_idx}"
                params.append(filters['max_price'])
                param_idx += 1
            
            if filters.get('min_beds'):
                query += f" AND bed >= ${param_idx}"
                params.append(filters['min_beds'])
                param_idx += 1
        
        query += " ORDER BY price DESC LIMIT 500"
        
        rows = await conn.fetch(query, *params)
        
        # Convert to list of dicts
        properties = []
        for row in rows:
            prop = dict(row)
            # Convert date objects to strings
            if prop.get('date_listed'):
                prop['date_listed'] = prop['date_listed'].isoformat()
            if prop.get('last_sold_date'):
                prop['last_sold_date'] = prop['last_sold_date'].isoformat()
            properties.append(prop)
        
        return properties


async def fetch_property_by_id(property_id: int):
    """Fetch a single property by ID"""
    async with get_connection() as conn:
        row = await conn.fetchrow("""
            SELECT 
                id, address, street, city, state, zip,
                latitude, longitude,
                for_sale, date_listed, days_on_market, status,
                price, price_per_square_foot,
                square_foot, bed, bath, lot_size, hoa,
                home_type, home_design, estimated_taxes, year_built,
                number_of_units, last_sold_date, last_sold_amount,
                estimated_monthly_rent
            FROM properties
            WHERE id = $1
        """, property_id)
        
        if row:
            prop = dict(row)
            if prop.get('date_listed'):
                prop['date_listed'] = prop['date_listed'].isoformat()
            if prop.get('last_sold_date'):
                prop['last_sold_date'] = prop['last_sold_date'].isoformat()
            return prop
        return None


async def fetch_all_properties():
    """Fetch all properties for initial load"""
    async with get_connection() as conn:
        rows = await conn.fetch("""
            SELECT 
                id, address, street, city, state, zip,
                latitude, longitude,
                for_sale, date_listed, days_on_market, status,
                price, price_per_square_foot,
                square_foot, bed, bath, lot_size, hoa,
                home_type, home_design, estimated_taxes, year_built,
                number_of_units, last_sold_date, last_sold_amount,
                estimated_monthly_rent
            FROM properties
            WHERE for_sale = true
            ORDER BY date_listed DESC
            LIMIT 1000
        """)
        
        properties = []
        for row in rows:
            prop = dict(row)
            if prop.get('date_listed'):
                prop['date_listed'] = prop['date_listed'].isoformat()
            if prop.get('last_sold_date'):
                prop['last_sold_date'] = prop['last_sold_date'].isoformat()
            properties.append(prop)
        
        return properties


async def insert_property(property_data: dict):
    """Insert a new property"""
    async with get_connection() as conn:
        row = await conn.fetchrow("""
            INSERT INTO properties (
                address, street, city, state, zip,
                latitude, longitude,
                for_sale, date_listed, status,
                price, square_foot, bed, bath, lot_size, hoa,
                home_type, home_design, estimated_taxes, year_built,
                number_of_units, last_sold_date, last_sold_amount,
                estimated_monthly_rent
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24
            )
            RETURNING id
        """,
            property_data['address'],
            property_data['street'],
            property_data['city'],
            property_data['state'],
            property_data['zip'],
            property_data['latitude'],
            property_data['longitude'],
            property_data.get('for_sale', True),
            property_data.get('date_listed'),
            property_data.get('status', 'For Sale'),
            property_data['price'],
            property_data['square_foot'],
            property_data['bed'],
            property_data['bath'],
            property_data.get('lot_size'),
            property_data.get('hoa', 0),
            property_data['home_type'],
            property_data.get('home_design'),
            property_data.get('estimated_taxes'),
            property_data.get('year_built'),
            property_data.get('number_of_units', 1),
            property_data.get('last_sold_date'),
            property_data.get('last_sold_amount'),
            property_data.get('estimated_monthly_rent')
        )
        return row['id']


async def get_property_stats():
    """Get aggregate statistics for dashboard"""
    async with get_connection() as conn:
        row = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_properties,
                COUNT(*) FILTER (WHERE for_sale = true) as for_sale_count,
                AVG(price) as avg_price,
                AVG(price_per_square_foot) as avg_price_per_sqft,
                COUNT(DISTINCT city) as cities_count,
                COUNT(DISTINCT state) as states_count
            FROM properties
        """)
        return dict(row)
