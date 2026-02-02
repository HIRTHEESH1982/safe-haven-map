# Technical Concepts for Viva Preparation

Beyond APIs, examiners often ask about **Authentication, Architecture, and Database Design**. Here is a breakdown of key concepts used in your project.

## 1. Authentication & Security
**Q: How does the login system work?**
*   **Method:** We use **JWT (JSON Web Tokens)**.
*   **Flow:**
    1.  User logs in → Server verifies password (using `bcryptjs`).
    2.  Server signs a **JWT** containing the user's ID and sends it back.
    3.  Frontend stores this token (in `localStorage`).
    4.  Every subsequent request sends this token in the `Authorization` header (`Bearer <token>`).
*   **OTP:** For security, we verify email ownership using a 6-digit OTP stored temporarily in the database.

**Q: How do you protect pages (like `/map`)?**
*   **Frontend:** We use a **Protected Route** component (`PrivateRoute.tsx`). It checks if a user is logged in (`isAuthenticated` is true). If not, it redirects to `/login`.
*   **Backend:** We use `authMiddleware`. It intercepts requests, checks the JWT signature, and rejects calls without a valid token.

## 2. Frontend State Management
**Q: How do you handle data in React?**
*   **Global State (Auth):** We use **React Context API** (`AuthContext`) because user login state is needed *everywhere* in the app.
*   **Server State (Incidents):** We use **TanStack Query (React Query)** (`useIncidents` hook).
    *   **Why?** It automatically handles caching, loading states, and refetching. When you report an incident, we call `invalidateQueries`, which automatically forces the map to refresh with the new data.

## 3. Database Design (MongoDB)
**Q: Why MongoDB?**
*   It's a **NoSQL** database, which is flexible for storing JSON-like data (incident reports vary in content).
*   **Geospatial Queries:** MongoDB has built-in support for **GeoJSON**. This is crucial for our map because it lets us efficiently find "incidents near a location" (though currently, we fetch all, this allows future scalability).

**Q: Explain the Incident Schema.**
*   `title`, `description` (Text)
*   `severity` (Enum: low/medium/high) - Used for coloring map markers.
*   `location` (String)
*   `latitude`, `longitude` (Numbers) - Critical for plotting on the map.
*   `reportedBy` (Reference) - Links to the User who reported it.

## 4. Architecture (MERN Stack)
**Q: Explain the project structure.**
*   **Frontend (Vite + React):** Handles the UI and user interaction.
*   **Backend (Express + Node.js):** Acts as the API server. It "talks" to the database and external APIs (Proxy).
*   **Database (MongoDB):** Stores persistent data.

**Q: What is the "Proxy" you mentioned?**
*   It's a middleman. The frontend talks to *our* backend, and *our* backend talks to the external routing service (ORS).
*   **Benefit:** The secret API key never leaves our server, so hackers successfully can't steal it from the browser.

## 5. Challenges Faced (Good for "Conclusion")
*   **Challenge:** Exposing API keys in the frontend.
*   **Solution:** Built a backend proxy to hide them.
*   **Challenge:** Keeping the map updated when a user reports something.
*   **Solution:** Used React Query to automatically refetch data upon successful submission.
