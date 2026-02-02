

# SafeRoute Chicago - Tourist Safety App

A production-ready React + TypeScript application helping tourists navigate Chicago safely by visualizing incident data on an interactive map.

---

## 🎨 Design & Theme
- **Professional blue color scheme** - Trust-inspiring, corporate feel
- Clean, modern card-based UI with Tailwind CSS
- Responsive design with mobile-first approach
- Desktop: Top navigation header
- Mobile: Bottom navigation bar

---

## 📁 Project Structure
```
/src
  /components    → Reusable UI components (Header, BottomNav, Cards, etc.)
  /pages         → Route-based page components
  /context       → AuthContext for JWT authentication state
  /services      → Axios API layer with interceptors
  /types         → TypeScript interfaces and types
  /hooks         → Custom hooks (useAuth, useIncidents, etc.)
```

---

## 🗺️ Pages & Features

### 1. Home Page (Dashboard)
- Welcome message for tourists
- Recent incidents feed
- Quick stats (total incidents, safe zones)
- Quick navigation to map and reporting

### 2. Safety Map Page
- Interactive Leaflet map centered on Chicago
- Color-coded incident markers by severity/category
- Heat map visualization of high-incident areas
- Clickable markers with incident details popup:
  - Title, description, location, date
- Legend showing severity levels

### 3. Report Incident Page
- Form to submit new safety reports:
  - Title, description, category dropdown
  - Location picker (click on map or enter coordinates)
- Success/error feedback
- Redirect after successful submission

### 4. Profile Page (Protected)
- User information from JWT token
- Count of incidents reported by user
- Account settings

### 5. Login & Register Pages
- Clean form validation
- Error handling with user-friendly messages
- Redirect to dashboard after success

---

## 🔐 Authentication System
- JWT-based authentication with Context API
- Token stored in localStorage
- Protected route wrapper for `/profile`
- AuthContext providing:
  - `user` state
  - `login()`, `logout()`, `register()` methods

---

## 🔌 API Integration (Mocked)
- Axios instance with base URL from environment variable
- Request interceptor to attach JWT token
- Mock data for incidents until backend is ready
- Prepared endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /incidents`
  - `POST /incidents`

---

## 📱 Navigation
- **Desktop**: Clean top header with logo and nav links
- **Mobile**: Fixed bottom navigation with icons
- Active route highlighting

---

## ✨ Additional Features
- Full TypeScript type safety
- Environment variable configuration (`VITE_API_URL`)
- Scalable, modular code architecture
- Production-ready folder structure

