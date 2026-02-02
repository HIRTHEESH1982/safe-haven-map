# API Usage Guide for Viva

This document explains **where** and **how** APIs are used in the Safe Haven Map application.

## 1. Internal Backend API (Our Custom Server)
We built our own Node.js/Express backend to handle authentication, user data, and incident reports.

*   **Base URL:** `/api` (Proxied in Vite to `http://localhost:5000/api`)
*   **Key Files:**
    *   **Frontend:** `src/services/api.ts` (Axios instance with interceptors for JWT)
    *   **Backend:** `backend/src/server.ts`, `backend/src/routes/`

### Key Endpoints:
*   **Authentication:**
    *   `POST /api/auth/register`: Creates a new user.
    *   `POST /api/auth/verify-otp`: Verifies the email OTP.
    *   `POST /api/auth/login`: Authenticates user and returns a JWT.
*   **Incidents:**
    *   `GET /api/incidents`: Fetches all approved safety incidents from MongoDB.
    *   `POST /api/incidents`: Submits a new incident (requires Authentication).

---

## 2. External APIs

### A. OpenRouteService (ORS) - Routing & Directions
Used to draw the route between the user's location and their destination.

*   **Usage:** We use the API to get coordinates for the path (polyline).
*   **Security Implementation (Critical for Viva):**
    *   We do **NOT** call ORS directly from the Frontend anymore to prevent exposing the API Key.
    *   **Frontend:** `src/services/routeService.ts` calls our *own* backend at `POST /api/proxy/ors/directions`.
    *   **Backend:** `backend/src/routes/proxy.ts` takes the request, adds the **secret API Key** (stored in backend `.env`), forwards it to ORS, and returns the result.
    *   **Why?** This is a security best practice to hide API keys.

### B. Chicago Data Portal (Socrata API) - Crime Data
Used to fetch real crime data to display on the map along with user reports.

*   **Key File:** `src/services/crimeService.ts`
*   **Endpoint:** `https://data.cityofchicago.org/resource/ijzp-q8t2.json`
*   **How it works:**
    *   We use a `SoQL` (Socrata Query Language) query to filter crimes from the last 30 days.
    *   Calculates a "severity" score locally based on the crime type (e.g., "THEFT" = High, "DECEPTIVE PRACTICE" = Medium).

### C. OpenStreetMap (OSM) - Map Tiles
Used visually to render the map tiles.

*   **Library:** `React-Leaflet` (which uses Leaflet.js).
*   **Source:** We use standard OSM tile servers (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
*   **Note:** This is an API call made by the browser for every map "square" you see.

---

## Summary Table for Viva

| API Name | Type | Where it's called | Purpose |
| :--- | :--- | :--- | :--- |
| **SafeHaven Backend** | REST API | `src/services/authService.ts` | Login, Register, Store Incidents |
| **OpenRouteService** | External | `backend/src/routes/proxy.ts` | Calculate safe paths (routing) |
| **Chicago Data** | External | `src/services/crimeService.ts` | Real-time crime statistics |
| **OpenStreetMap** | Tile Server | `src/components/map/Map.tsx` | Visual map background |
