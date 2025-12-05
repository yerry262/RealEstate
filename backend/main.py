# Deal Finder API
# FastAPI backend for real estate investment analysis

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from contextlib import asynccontextmanager
import math
import os

from database import (
    init_db, close_db, 
    fetch_properties_in_bbox, fetch_property_by_id, 
    fetch_all_properties, insert_property, get_property_stats
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    try:
        await init_db()
        print("✅ API connected to database")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("   Running in mock data mode")
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Deal Finder API",
    description="Real estate investment analysis and property data API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ MODELS ============

class PropertyBase(BaseModel):
    address: str
    street: str
    city: str
    state: str
    zip: str
    latitude: float
    longitude: float
    
    for_sale: bool = True
    status: str = "For Sale"
    date_listed: Optional[date] = None
    days_on_market: int = 0
    
    price: float
    sqft: int
    beds: int
    baths: float
    price_per_sqft: float
    lot_size: int
    hoa: float = 0
    
    home_type: str
    home_design: Optional[str] = None
    estimated_taxes: float
    year_built: int
    units: int = 1
    
    last_sold_date: Optional[date] = None
    last_sold_amount: Optional[float] = None
    
    estimated_monthly_rent: Optional[float] = None

class PropertyCreate(PropertyBase):
    pass

class Property(PropertyBase):
    id: int
    
    class Config:
        from_attributes = True

class AnalysisAssumptions(BaseModel):
    down_payment_percent: float = 0.25
    interest_rate: float = 0.07
    loan_term_years: int = 30
    closing_cost_percent: float = 0.03
    rehab_budget: float = 0
    vacancy_rate: float = 0.08
    maintenance_percent: float = 0.01
    capex_percent: float = 0.01
    management_percent: float = 0.10
    insurance_rate: float = 0.005
    estimated_rent: Optional[float] = None

class DealAnalysis(BaseModel):
    # Loan details
    down_payment: float
    loan_amount: float
    closing_costs: float
    total_cash_invested: float
    monthly_mortgage: float
    
    # Income
    monthly_rent: float
    effective_gross_income: float
    
    # Expenses
    monthly_expenses: float
    
    # Returns
    monthly_noi: float
    annual_noi: float
    monthly_cash_flow: float
    annual_cash_flow: float
    cap_rate: float
    cash_on_cash: float
    dscr: float
    break_even_occupancy: float
    one_percent_rule: float
    passes_one_percent: bool
    deal_score: int

class BoundingBox(BaseModel):
    north: float
    south: float
    east: float
    west: float

# ============ CALCULATOR FUNCTIONS ============

def calculate_mortgage_payment(principal: float, annual_rate: float, years: int) -> float:
    """Calculate monthly mortgage payment (P&I)"""
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    
    if monthly_rate == 0:
        return principal / num_payments
    
    payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / \
              ((1 + monthly_rate) ** num_payments - 1)
    
    return payment

def estimate_rent(sqft: int, beds: int, baths: float, year_built: int) -> float:
    """Estimate monthly rent based on property characteristics"""
    base_rent_per_sqft = 1.2
    
    age = 2024 - year_built
    if age < 10:
        base_rent_per_sqft *= 1.15
    elif age < 30:
        base_rent_per_sqft *= 1.0
    else:
        base_rent_per_sqft *= 0.9
    
    rent = sqft * base_rent_per_sqft
    rent += (beds - 2) * 100
    rent += (baths - 1) * 50
    
    return round(rent)

def analyze_property(property: Property, assumptions: AnalysisAssumptions) -> DealAnalysis:
    """Perform full investment analysis on a property"""
    
    price = property.price
    sqft = property.sqft
    year_built = property.year_built
    estimated_taxes = property.estimated_taxes
    hoa = property.hoa
    beds = property.beds
    baths = property.baths
    units = property.units
    
    # Calculate loan details
    down_payment = price * assumptions.down_payment_percent
    loan_amount = price - down_payment
    closing_costs = price * assumptions.closing_cost_percent
    total_cash_invested = down_payment + closing_costs + assumptions.rehab_budget
    
    # Calculate monthly mortgage
    monthly_mortgage = calculate_mortgage_payment(
        loan_amount, 
        assumptions.interest_rate, 
        assumptions.loan_term_years
    )
    
    # Estimate rent if not provided
    if assumptions.estimated_rent:
        monthly_rent = assumptions.estimated_rent
    elif property.estimated_monthly_rent:
        monthly_rent = property.estimated_monthly_rent
    else:
        monthly_rent = estimate_rent(sqft, beds, baths, year_built) * units
    
    # Calculate expenses
    monthly_taxes = estimated_taxes / 12
    monthly_insurance = (price * assumptions.insurance_rate) / 12
    monthly_maintenance = (price * assumptions.maintenance_percent) / 12
    monthly_capex = (price * assumptions.capex_percent) / 12
    monthly_management = monthly_rent * assumptions.management_percent
    
    total_monthly_expenses = (
        monthly_taxes + monthly_insurance + hoa + 
        monthly_maintenance + monthly_capex + monthly_management
    )
    
    # Calculate NOI and cash flow
    effective_gross_income = monthly_rent * (1 - assumptions.vacancy_rate)
    monthly_noi = effective_gross_income - total_monthly_expenses
    annual_noi = monthly_noi * 12
    
    monthly_cash_flow = monthly_noi - monthly_mortgage
    annual_cash_flow = monthly_cash_flow * 12
    
    # Calculate returns
    cap_rate = annual_noi / price if price > 0 else 0
    cash_on_cash = annual_cash_flow / total_cash_invested if total_cash_invested > 0 else 0
    dscr = annual_noi / (monthly_mortgage * 12) if monthly_mortgage > 0 else float('inf')
    
    # Break-even occupancy
    break_even_occupancy = (total_monthly_expenses + monthly_mortgage) / monthly_rent if monthly_rent > 0 else 1
    
    # 1% Rule
    one_percent_rule = monthly_rent / price if price > 0 else 0
    passes_one_percent = one_percent_rule >= 0.01
    
    # Deal score (0-100)
    deal_score = 0
    
    if cash_on_cash >= 0.12:
        deal_score += 30
    elif cash_on_cash >= 0.08:
        deal_score += 20
    elif cash_on_cash >= 0.05:
        deal_score += 10
    
    if cap_rate >= 0.08:
        deal_score += 25
    elif cap_rate >= 0.06:
        deal_score += 15
    elif cap_rate >= 0.04:
        deal_score += 5
    
    if dscr >= 1.5:
        deal_score += 20
    elif dscr >= 1.25:
        deal_score += 15
    elif dscr >= 1.0:
        deal_score += 5
    
    if passes_one_percent:
        deal_score += 15
    elif one_percent_rule >= 0.008:
        deal_score += 8
    
    if monthly_cash_flow >= 300:
        deal_score += 10
    elif monthly_cash_flow >= 200:
        deal_score += 5
    
    return DealAnalysis(
        down_payment=down_payment,
        loan_amount=loan_amount,
        closing_costs=closing_costs,
        total_cash_invested=total_cash_invested,
        monthly_mortgage=monthly_mortgage,
        monthly_rent=monthly_rent,
        effective_gross_income=effective_gross_income,
        monthly_expenses=total_monthly_expenses,
        monthly_noi=monthly_noi,
        annual_noi=annual_noi,
        monthly_cash_flow=monthly_cash_flow,
        annual_cash_flow=annual_cash_flow,
        cap_rate=cap_rate,
        cash_on_cash=cash_on_cash,
        dscr=dscr,
        break_even_occupancy=break_even_occupancy,
        one_percent_rule=one_percent_rule,
        passes_one_percent=passes_one_percent,
        deal_score=deal_score
    )

# ============ API ENDPOINTS ============

@app.get("/")
async def root():
    return {"message": "Deal Finder API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/analyze", response_model=DealAnalysis)
async def analyze_deal(property: PropertyCreate, assumptions: Optional[AnalysisAssumptions] = None):
    """
    Analyze a property deal with given assumptions.
    Returns detailed investment metrics.
    """
    if assumptions is None:
        assumptions = AnalysisAssumptions()
    
    # Convert to Property with fake ID for analysis
    prop = Property(id=0, **property.model_dump())
    return analyze_property(prop, assumptions)

@app.get("/api/properties")
async def get_properties(
    north: float = Query(None, description="North boundary latitude"),
    south: float = Query(None, description="South boundary latitude"),
    east: float = Query(None, description="East boundary longitude"),
    west: float = Query(None, description="West boundary longitude"),
    status: Optional[str] = Query(None, description="Filter by status"),
    home_type: Optional[str] = Query(None, description="Filter by home type"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_beds: Optional[int] = Query(None, description="Minimum bedrooms"),
):
    """
    Get properties within a bounding box or all properties.
    Uses PostGIS for spatial queries.
    """
    try:
        # If bounding box provided, use spatial query
        if all([north, south, east, west]):
            filters = {
                'status': status,
                'home_type': home_type,
                'min_price': min_price,
                'max_price': max_price,
                'min_beds': min_beds,
            }
            properties = await fetch_properties_in_bbox(north, south, east, west, filters)
        else:
            # Return all properties
            properties = await fetch_all_properties()
        
        # Calculate analysis for each property
        results = []
        for prop in properties:
            # Add analysis data
            analysis = calculate_property_analysis(prop)
            prop['analysis'] = analysis
            
            # Rename fields for frontend compatibility
            prop['sqft'] = prop.pop('square_foot', 0)
            prop['beds'] = prop.pop('bed', 0)
            prop['baths'] = prop.pop('bath', 0)
            prop['pricePerSqft'] = prop.pop('price_per_square_foot', 0)
            prop['lotSize'] = prop.pop('lot_size', 0)
            prop['homeType'] = prop.pop('home_type', '')
            prop['homeDesign'] = prop.pop('home_design', '')
            prop['estimatedTaxes'] = prop.pop('estimated_taxes', 0)
            prop['yearBuilt'] = prop.pop('year_built', 0)
            prop['units'] = prop.pop('number_of_units', 1)
            prop['dateListed'] = prop.pop('date_listed', None)
            prop['daysOnMarket'] = prop.pop('days_on_market', 0)
            prop['forSale'] = prop.pop('for_sale', True)
            prop['lastSoldDate'] = prop.pop('last_sold_date', None)
            prop['lastSoldAmount'] = prop.pop('last_sold_amount', 0)
            prop['estimatedMonthlyRent'] = prop.pop('estimated_monthly_rent', 0)
            
            results.append(prop)
        
        return results
        
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def calculate_property_analysis(prop: dict) -> dict:
    """Calculate investment metrics for a property"""
    price = float(prop.get('price', 0))
    sqft = int(prop.get('square_foot', 0))
    year_built = int(prop.get('year_built', 2000))
    estimated_taxes = float(prop.get('estimated_taxes', 0) or 0)
    hoa = float(prop.get('hoa', 0) or 0)
    beds = int(prop.get('bed', 0))
    baths = float(prop.get('bath', 0))
    units = int(prop.get('number_of_units', 1))
    
    # Use stored rent or estimate
    monthly_rent = float(prop.get('estimated_monthly_rent', 0) or 0)
    if monthly_rent == 0 and sqft > 0:
        monthly_rent = estimate_rent(sqft, beds, baths, year_built) * units
    
    if price == 0:
        return {'dealScore': 0, 'capRate': 0, 'cashOnCash': 0, 'monthlyCashFlow': 0, 'monthlyMortgage': 0}
    
    # Assumptions
    down_payment_pct = 0.25
    interest_rate = 0.07
    loan_term = 30
    vacancy_rate = 0.08
    maintenance_pct = 0.01
    capex_pct = 0.01
    management_pct = 0.10
    insurance_rate = 0.005
    
    # Calculate loan
    down_payment = price * down_payment_pct
    loan_amount = price - down_payment
    closing_costs = price * 0.03
    total_cash = down_payment + closing_costs
    
    # Monthly mortgage
    monthly_rate = interest_rate / 12
    num_payments = loan_term * 12
    if monthly_rate > 0:
        monthly_mortgage = loan_amount * (monthly_rate * (1 + monthly_rate)**num_payments) / ((1 + monthly_rate)**num_payments - 1)
    else:
        monthly_mortgage = loan_amount / num_payments
    
    # Expenses
    monthly_taxes = estimated_taxes / 12
    monthly_insurance = (price * insurance_rate) / 12
    monthly_maintenance = (price * maintenance_pct) / 12
    monthly_capex = (price * capex_pct) / 12
    monthly_management = monthly_rent * management_pct
    total_expenses = monthly_taxes + monthly_insurance + hoa + monthly_maintenance + monthly_capex + monthly_management
    
    # Cash flow
    effective_income = monthly_rent * (1 - vacancy_rate)
    monthly_noi = effective_income - total_expenses
    annual_noi = monthly_noi * 12
    monthly_cash_flow = monthly_noi - monthly_mortgage
    annual_cash_flow = monthly_cash_flow * 12
    
    # Returns
    cap_rate = annual_noi / price if price > 0 else 0
    cash_on_cash = annual_cash_flow / total_cash if total_cash > 0 else 0
    dscr = annual_noi / (monthly_mortgage * 12) if monthly_mortgage > 0 else 0
    one_pct_rule = monthly_rent / price if price > 0 else 0
    
    # Deal score
    deal_score = 0
    if cash_on_cash >= 0.12: deal_score += 30
    elif cash_on_cash >= 0.08: deal_score += 20
    elif cash_on_cash >= 0.05: deal_score += 10
    
    if cap_rate >= 0.08: deal_score += 25
    elif cap_rate >= 0.06: deal_score += 15
    elif cap_rate >= 0.04: deal_score += 5
    
    if dscr >= 1.5: deal_score += 20
    elif dscr >= 1.25: deal_score += 15
    elif dscr >= 1.0: deal_score += 5
    
    if one_pct_rule >= 0.01: deal_score += 15
    elif one_pct_rule >= 0.008: deal_score += 8
    
    if monthly_cash_flow >= 300: deal_score += 10
    elif monthly_cash_flow >= 200: deal_score += 5
    
    return {
        'dealScore': deal_score,
        'capRate': round(cap_rate, 4),
        'cashOnCash': round(cash_on_cash, 4),
        'monthlyCashFlow': round(monthly_cash_flow, 2),
        'monthlyMortgage': round(monthly_mortgage, 2),
        'dscr': round(dscr, 2),
        'monthlyRent': round(monthly_rent, 2),
    }


@app.get("/api/properties/{property_id}")
async def get_property(property_id: int):
    """Get a single property by ID."""
    try:
        prop = await fetch_property_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Add analysis
        prop['analysis'] = calculate_property_analysis(prop)
        return prop
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/properties")
async def create_property(property: PropertyCreate):
    """Create a new property (for off-market uploads)."""
    try:
        property_id = await insert_property(property.model_dump())
        return {"id": property_id, "message": "Property created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats():
    """Get aggregate statistics for the database"""
    try:
        stats = await get_property_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ HEATMAP DATA ENDPOINTS ============

@app.get("/api/heatmap/deal-score")
async def get_deal_score_heatmap(
    north: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    west: float = Query(...)
):
    """
    Get aggregated deal scores for heatmap visualization.
    Returns hex-binned data for Deck.gl.
    """
    # In production, this would aggregate deal scores by geographic area
    return {"message": "Requires database connection"}

@app.get("/api/heatmap/cap-rate")
async def get_cap_rate_heatmap(
    north: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    west: float = Query(...)
):
    """Get aggregated cap rates for heatmap."""
    return {"message": "Requires database connection"}

@app.get("/api/heatmap/cash-flow")
async def get_cash_flow_heatmap(
    north: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    west: float = Query(...)
):
    """Get aggregated cash flow for heatmap."""
    return {"message": "Requires database connection"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
