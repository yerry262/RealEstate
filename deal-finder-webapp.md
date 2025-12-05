# Real Estate Deal Finder Web Application Architecture

## Overview
This document outlines the architecture for a React-based web application designed to visualize real estate opportunities. The system aggregates listings from multiple sources (MLS, off-market, wholesalers), calculates investment metrics (ROI, Cash Flow) in real-time, and visualizes "best deals" using interactive heatmaps overlaid on satellite imagery.

## Architecture Diagram

```mermaid
graph TD
    subgraph "Frontend (React)"
        UI[User Interface]
        Map[Mapbox GL JS]
        Vis[Deck.gl Visualization]
        State[State Management (Zustand)]
    end

    subgraph "Backend (Python/FastAPI)"
        API[REST API Gateway]
        Auth[Authentication Service]
        Calc[Deal Calculator Engine]
        Ingest[Data Ingestion Pipeline]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL + PostGIS)]
        Cache[(Redis)]
    end

    subgraph "External Sources"
        MLS[MLS Aggregators (RentCast/RapidAPI)]
        User[User Uploads (CSV/Off-market)]
        Pub[Public Records (Tax/Zoning)]
    end

    UI --> State
    State --> Map
    Map --> Vis
    State <--> API
    API --> Calc
    API --> DB
    API --> Cache
    Ingest --> MLS
    Ingest --> User
    Ingest --> Pub
    Ingest --> DB
```

## Core Components

### 1. Frontend: React + Geospatial Visualization
The frontend is a Single Page Application (SPA) focused on high-performance map rendering.

*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS (for rapid UI development)
*   **Map Engine:** **Mapbox GL JS** (via `react-map-gl`).
    *   *Why:* Best-in-class vector tiles, satellite imagery, and customization.
*   **Data Visualization:** **Deck.gl**.
    *   *Why:* Handles thousands of data points efficiently. Essential for the "Heat Map" requirement. It allows creating layers like `HexagonLayer` or `HeatmapLayer` that can aggregate data properties (e.g., "Average ROI") rather than just point density.
*   **State Management:** **Zustand** or **TanStack Query**.
    *   *Why:* Managing complex map state (viewport, selected filters, cached data) requires robust state management.

### 2. Backend: Python Analysis Engine
Python is chosen for its strength in data analysis and financial modeling.

*   **Framework:** **FastAPI**.
    *   *Why:* High performance, native async support (good for I/O bound API calls), and automatic OpenAPI documentation.
*   **Deal Calculator Engine:**
    *   Implements the logic from the `InvestmentAnalyst` agent.
    *   Calculates: Cash-on-Cash Return, Cap Rate, NOI, DSCR.
    *   *Dynamic:* Recalculates values when user adjusts parameters (e.g., "What if I put 25% down instead of 20%?").

### 3. Database: Geospatial Storage
*   **Primary DB:** **PostgreSQL** with **PostGIS** extension.
    *   *Why:* The industry standard for geospatial data. Allows queries like "Find all properties within this map viewport" or "Find properties within 1 mile of this school".
*   **Caching:** **Redis**.
    *   *Why:* To cache expensive API responses from third-party data providers and heavy calculation results.

## Key Features Implementation

### A. The Map & Heatmap Overlays
The core feature is visualizing "value" geographically.

1.  **Satellite Layer:** Base layer using Mapbox Satellite style.
2.  **Pin Layer (Listings):**
    *   Displays individual properties.
    *   Color-coded by status (For Sale, Foreclosure, Off-Market).
3.  **Heatmap Layers (Toggles):**
    *   Users can toggle overlays via a control panel.
    *   **Implementation:** Use `deck.gl`'s `HexagonLayer` or `ScreenGridLayer`.
    *   **Metric 1: ROI Heatmap:** Aggregates the `estimated_return` of points in a hex bin. Green = High ROI, Red = Low ROI.
    *   **Metric 2: Days on Market (DOM):** Visualizes stale listings. Red = High DOM (Negotiation power).
    *   **Metric 3: Price vs Rent:** Visualizes the Rent-to-Price ratio (1% rule).

### B. Property Detail View (The "Click")
When a pin is clicked:
1.  **Sidebar/Modal opens.**
2.  **Data Fetch:** Frontend requests full details from API `GET /properties/{id}`.
3.  **Interactive Calculator:**
    *   Displays: Price, SqFt, Year Built.
    *   **Editable Fields:** Down Payment %, Interest Rate, Rehab Budget.
    *   **Real-time Updates:** Changing a field instantly updates the "Monthly Cash Flow" and "ROI" displayed.

### C. Data Ingestion (The "Sources")
Handling diverse data sources is the biggest challenge.

1.  **MLS/Aggregators:**
    *   *Challenge:* Direct scraping Zillow/Redfin is difficult/blocked.
    *   *Solution:* Use APIs like **RentCast**, **Realty Mole**, or **RapidAPI** wrappers.
    *   *Process:* Scheduled jobs (Celery/BullMQ) fetch listings for target zip codes and normalize them into the DB.
2.  **Off-Market/Wholesalers:**
    *   *Feature:* "Upload CSV".
    *   *Process:* User uploads a spreadsheet from a wholesaler or direct mail list. System geocodes addresses (Google Maps Geocoding API) and adds them to the map.
3.  **Foreclosures/Auctions:**
    *   Ingest from county data portals or specialized foreclosure APIs (e.g., ATTOM Data).

## Data Flow

1.  **User** pans the map to a specific region.
2.  **Frontend** sends bounding box coordinates (NE/SW corners) to **Backend**.
3.  **Backend** queries **PostGIS**: `SELECT * FROM properties WHERE location && ST_MakeEnvelope(...)`.
4.  **Backend** enriches data:
    *   If data is stale (>24h), fetch fresh data from **External API**.
    *   Run **Deal Calculator** on raw data to generate `roi`, `cap_rate`, `cash_flow`.
5.  **Backend** returns JSON array of properties with coordinates and calculated metrics.
6.  **Frontend** renders:
    *   **Pins** at coordinates.
    *   **Heatmap** generated from the returned metrics.

## Technology Stack Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend** | React + Vite | Fast development, rich ecosystem |
| **Map Lib** | Mapbox GL JS | Best vector maps & satellite imagery |
| **Vis Lib** | Deck.gl | High-performance WebGL visualizations |
| **Backend** | Python (FastAPI) | Great for math/financial logic |
| **Database** | PostgreSQL + PostGIS | Essential for spatial queries |
| **Data APIs** | RentCast / RapidAPI | Reliable property data access |

## Development Roadmap

1.  **Phase 1: Skeleton**
    *   Set up React + Mapbox.
    *   Set up FastAPI + PostGIS.
    *   Create a simple "Add Property" API.
2.  **Phase 2: Data Integration**
    *   Integrate one reliable data source (e.g., RentCast API).
    *   Implement the "Deal Calculator" logic in Python.
3.  **Phase 3: Visualization**
    *   Implement Deck.gl heatmap layers.
    *   Add toggles for different metrics (ROI, Rent, Price).
4.  **Phase 4: Interaction**
    *   Build the Property Detail sidebar.
    *   Make the financial calculator interactive.
5.  **Phase 5: Advanced Sources**
    *   Add CSV upload for off-market deals.
    *   Add filters for Foreclosures/FSBO.
