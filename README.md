# DriveLedger - Smart ELD & Trip Simulator

A full-stack application built for a driver assessment that simulates Hours of Service (HOS) rules, trip planning, and ELD log generation.

## Core Features
- **HOS Simulation**: Automatically calculates driving limits (11h), rest periods (10h), and 70hr/8day cycle rules.
- **Global Trip Planner**: Real-time location search using Nominatim API and route generation.
- **Fueling Logic**: Automatically assumes and marks fueling stops every 1,000 miles.
- **Interactive Map**: Visualizes the route with custom markers for Pickup, Drop-off, Rest Breaks, and Fueling.
- **ELD Logs**: Generates daily log sheets with status graphs for longer trips.
- **Full-Stack Auth**: Secure registration and login using Django backend with driver profile synchronization.

## Tech Stack
- **Frontend**: React (Vite), Leaflet (Maps), Framer Motion, Axios, Lucide Icons.
- **Backend**: Django, Django REST Framework, Requests (for Geocoding/OSRM).
- **Database**: SQLite (Development).

## Getting Started

### 1. Backend Setup (Django)
```bash
cd backend
# Create virtual environment if needed
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\activate
# Install requirements (ensure you have django, djangorestframework, django-cors-headers, requests)
pip install django djangorestframework django-cors-headers requests
# Run migrations
python manage.py migrate
# Start server
python manage.py runserver
```

### 2. Frontend Setup (React)
```bash
cd frontend
# Install dependencies
npm install
# Start development server
npm run dev
```

## Assumptions & Rules
- 70hrs / 8 days cycle for property-carrying drivers.
- 10 consecutive hours off-duty for daily reset.
- 30-minute break required after 8 hours of driving.
- Fueling stop (30 mins) every 1,000 miles.
- 1 hour dwell time for both Pickup and Drop-off.
