# How to Run Deal Finder

Step-by-step guide to get the Deal Finder app running locally.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Mapbox Account** - [Sign up free](https://mapbox.com/)

---

## Step 1: Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Mapbox token to `.env`:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
   ```

---

## Step 2: Install Frontend Dependencies

```powershell
cd RealEstate
npm install
```



## Step 3: Start the Database

Make sure Docker Desktop is running, then:

```powershell
cd RealEstate

# Start PostgreSQL + PostGIS database
.\db.ps1 start
```

**First run:** Docker will download the PostGIS image (~500MB) and initialize the database with 45 test properties.

**Expected output:**
```
🚀 Starting Deal Finder Database...
Creating deal-finder-db ... done
Creating deal-finder-pgadmin ... done

✅ Database started successfully!
   PostgreSQL: localhost:5432
   pgAdmin:    http://localhost:5050
   User:       dealfinder
   Password:   dealfinder123
```

### Database Commands

| Command | Description |
|---------|-------------|
| `.\db.ps1 start` | Start the database |
| `.\db.ps1 stop` | Stop the database (data preserved) |
| `.\db.ps1 status` | Check if database is running |
| `.\db.ps1 logs` | View database logs |
| `.\db.ps1 restart` | Restart the database |
| `.\db.ps1 reset` | **DELETE all data** and start fresh |

---

## Step 4: Start the Backend API

Open a **new terminal**:

```powershell
cd RealEstate/backend

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the API server
python -m uvicorn main:app --reload
```

**Expected output:**
```
✅ Database connection pool created
✅ API connected to database
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

API documentation available at: http://localhost:8000/docs

---

## Step 5: Start the Frontend

Open a **new terminal**:

```powershell
cd RealEstate

npm run dev
```

**Expected output:**
```
  VITE v5.4.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 6: Open the App

Go to **http://localhost:5173** in your browser.

You should see:
- 🗺️ Satellite map centered on Dallas, TX
- 📍 Property pins across multiple cities
- 🟢 "Connected to Database" badge in bottom-right corner

---

## Troubleshooting

### "Database unavailable" error

The app requires the database to be running:
- Database isn't running → Run `.\db.ps1 start`
- Backend API isn't running → Start uvicorn in the backend folder
- Check Docker Desktop is running

### Docker errors

```powershell
# Check Docker is running
docker info

# If not, start Docker Desktop and wait for it to be ready
```

### Port already in use

```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Find what's using port 8000
netstat -ano | findstr :8000
```

### Reset everything

```powershell
# Stop all services
.\db.ps1 stop

# Delete database data
.\db.ps1 reset

# Start fresh
.\db.ps1 start
```

---

## Access pgAdmin (Database GUI)

1. Go to http://localhost:5050
2. Login:
   - Email: `admin@dealfinder.com`
   - Password: `admin123`
3. Add a server:
   - Name: `Deal Finder`
   - Host: `db` (not localhost)
   - Port: `5432`
   - Database: `deal_finder`
   - Username: `dealfinder`
   - Password: `dealfinder123`

---

## Quick Start (All Commands)

```powershell
# Terminal 1 - Database
cd RealEstate
.\db.ps1 start

# Terminal 2 - Backend
cd RealEstate/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Terminal 3 - Frontend
cd RealEstate
npm run dev

# Open browser to http://localhost:5173
```

---

## Stopping Everything

```powershell
# In frontend terminal: Ctrl+C
# In backend terminal: Ctrl+C
# Stop database:
.\db.ps1 stop
```

Your data is preserved in `./db-data/` and will be there next time you start.
