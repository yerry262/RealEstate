# Deal Finder - Real Estate Investment Map

An interactive React application for visualizing and analyzing real estate investment opportunities. Features satellite maps with heatmap overlays showing deal quality metrics, and a powerful property calculator for instant investment analysis.

![Deal Finder Screenshot](docs/screenshot.png)


## Features

### 🗺️ Interactive Map
- **Satellite imagery** with street labels via Mapbox
- **Property pins** color-coded by deal score (Green = Excellent, Red = Poor)
- **Click any property** to open detailed analysis sidebar

### 🔥 Smart Heatmaps
Toggle different metrics to visualize opportunities:
- **Deal Score** - Overall investment quality (0-100)
- **Cash-on-Cash Return** - Annual return on cash invested
- **Cap Rate** - Net Operating Income / Price
- **Days on Market** - Find motivated sellers
- **Price per Sq Ft** - Identify underpriced areas
- **Monthly Cash Flow** - Net income after expenses

### 📊 Investment Calculator
Click any property to see:
- Complete cash flow breakdown
- Adjustable assumptions (down payment, interest rate, rehab costs)
- Real-time metric recalculation
- Deal score with pass/fail criteria

### 🔍 Filters
- Property status (For Sale, Foreclosure, Off-Market, etc.)
- Property type (Single Family, Duplex, Triplex, etc.)
- Price range
- Minimum bedrooms
- Minimum deal score

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Maps | Mapbox GL JS |
| Visualizations | Deck.gl |
| State Management | Zustand |
| Backend | Python FastAPI |
| Database | PostgreSQL + PostGIS |
| Container | Docker |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for database)
- Mapbox account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/RealEstate.git
cd RealEstate
npm install
```

### 2. Configure Mapbox

Get a free token at [mapbox.com](https://mapbox.com) and create a `.env` file:

```bash
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

### 3. Start the Database

```powershell
# Start PostgreSQL + PostGIS in Docker
.\db.ps1 start

# Check status
.\db.ps1 status

# View logs
.\db.ps1 logs

# Stop (data is preserved)
.\db.ps1 stop

# Reset (deletes all data)
.\db.ps1 reset
```

The database will:
- Create the `properties` table with all required columns
- Insert 45 test properties across major cities (Dallas, Austin, Houston, San Antonio, Phoenix, Atlanta, Tampa, Nashville)
- Persist data in `./db-data/` even after stopping

### 4. Start the Backend API

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Run the Frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Note:** The database must be running for properties to load. Start it with `.\db.ps1 start`

## Database Schema

The `properties` table includes:

| Column | Type | Description |
|--------|------|-------------|
| address | VARCHAR | Full address string |
| street | VARCHAR | Street address |
| city | VARCHAR | City name |
| state | VARCHAR(2) | State code (TX, FL, etc.) |
| zip | VARCHAR(10) | ZIP code |
| latitude/longitude | DECIMAL | Coordinates for map |
| for_sale | BOOLEAN | Is property for sale |
| date_listed | DATE | When listed |
| price | DECIMAL | Asking price |
| square_foot | INTEGER | Total sq ft |
| bed | INTEGER | Number of bedrooms |
| bath | DECIMAL | Number of bathrooms |
| price_per_square_foot | DECIMAL | Auto-calculated |
| lot_size | INTEGER | Lot size in sq ft |
| hoa | DECIMAL | Monthly HOA fee |
| home_type | VARCHAR | Single Family, Duplex, etc. |
| home_design | VARCHAR | Ranch, Modern, etc. |
| estimated_taxes | DECIMAL | Annual property taxes |
| year_built | INTEGER | Year constructed |
| number_of_units | INTEGER | Units (for multi-family) |
| last_sold_date | DATE | Previous sale date |
| last_sold_amount | DECIMAL | Previous sale price |

## Database Management

### Access via pgAdmin

1. Go to http://localhost:5050
2. Login: `admin@dealfinder.com` / `admin123`
3. Add server: Host=`db`, Port=`5432`, User=`dealfinder`, Password=`dealfinder123`

### Direct SQL Access

```bash
docker exec -it deal-finder-db psql -U dealfinder -d deal_finder
```

### Example Queries

```sql
-- Find properties within a map area
SELECT * FROM properties 
WHERE location && ST_MakeEnvelope(-97.0, 32.5, -96.5, 33.0, 4326);

-- Find properties within 5km of downtown Dallas
SELECT * FROM properties 
WHERE ST_DWithin(
    location::geography, 
    ST_SetSRID(ST_MakePoint(-96.7970, 32.7767), 4326)::geography, 
    5000
);

-- Get stats by city
SELECT city, COUNT(*) as count, AVG(price) as avg_price 
FROM properties 
GROUP BY city;
```

## Project Structure

```
RealEstate/
├── src/
│   ├── components/
│   │   ├── MapView.jsx        # Main map with Deck.gl layers
│   │   ├── PropertySidebar.jsx # Detail view with calculator
│   │   ├── PropertyPopup.jsx   # Hover tooltip
│   │   └── ControlPanel.jsx    # Heatmap/filter controls
│   ├── store/
│   │   └── useStore.js        # Zustand state management
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── utils/
│   │   └── calculations.js    # Investment math functions
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   ├── main.py               # FastAPI application
│   ├── database.py           # Database connection pool
│   ├── requirements.txt      # Python dependencies
│   └── init-db/
│       ├── 01-schema.sql     # Database schema
│       └── 02-seed-data.sql  # Test property data
├── docker-compose.yml        # PostgreSQL + pgAdmin
├── db.ps1                    # Database management script
├── how-to-run.md             # Detailed setup guide
├── .env.example              # Environment template
└── README.md
```

## Investment Metrics

### Deal Score (0-100)
Weighted score based on:
- Cash-on-Cash Return (30 pts)
- Cap Rate (25 pts)
- DSCR (20 pts)
- 1% Rule (15 pts)
- Monthly Cash Flow (10 pts)

### Pass Criteria
- ✅ Cash-on-Cash ≥ 8%
- ✅ Cap Rate ≥ 6%
- ✅ DSCR ≥ 1.25
- ✅ Monthly Cash Flow > $0

## Data Sources

The app is designed to aggregate from multiple sources:

| Source | Status | Notes |
|--------|--------|-------|
| PostgreSQL Database | ✅ Working | 45 seeded test properties |
| CSV Upload | 🚧 Planned | For wholesaler lists |
| RentCast API | 🚧 Planned | MLS data aggregator |
| Public Records | 🚧 Planned | Tax/zoning data |

## Customization

### Add New Heatmap Metrics

Edit `src/store/useStore.js`:

```javascript
export const HEATMAP_METRICS = {
  myMetric: {
    id: 'myMetric',
    label: 'My Custom Metric',
    description: 'Description here',
    getValue: (property) => property.someValue,
    colorRange: [[255, 0, 0], [255, 255, 0], [0, 255, 0]],
  },
  // ...
};
```

### Modify Deal Score Calculation

Edit `src/utils/calculations.js` in the `analyzeProperty` function.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

Built for real estate investors who want to find deals faster. 🏠💰
