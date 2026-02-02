# Code Implementation Map

This guide links the **Technical Concepts** directly to the **Files** in your project where they are implemented. Open these files to show the examiner.

---

## 1. Authentication (JWT & Security)
**Concept:** Users log in, receive a token, and the app saves it.
*   **Frontend Logic:** `src/context/AuthContext.tsx`
    *   *Look for:* `login` function, `localStorage.setItem('token', ...)`
*   **Backend Logic:** `backend/src/routes/auth.ts`
    *   *Look for:* `router.post('/login', ...)` where we use `bcrypt.compare` and `jwt.sign`.
*   **User Model:** `backend/src/models/User.ts`
    *   *Look for:* The Mongoose schema defining `email`, `password`, etc.

## 2. Route Protection (Private Pages)
**Concept:** Preventing users from seeing the Map/Report pages unless they are logged in.
*   **The Guard Component:** `src/components/auth/PrivateRoute.tsx`
    *   *Look for:* `if (!isAuthenticated) return <Navigate to="/login" />`
*   **Usage:** `src/App.tsx`
    *   *Look for:* `<PrivateRoute><MapPage /></PrivateRoute>`

## 3. UI-Only Navigation (Deep Link Restriction)
**Concept:** Preventing users from typing URLs manually.
*   **The Guard Component:** `src/components/auth/UiOnlyRoute.tsx`
    *   *Look for:* `location.state?.fromUi` check.
*   **Backend Proxy (Hiding API Keys):** `backend/src/routes/proxy.ts`
    *   *Look for:* `process.env.ORS_API_KEY` being used on the SERVER side, not the client.

## 4. State Management (Data Fetching)
**Concept:** How we load incidents and keep them updated.
*   **React Query Hook:** `src/hooks/useIncidents.ts`
    *   *Look for:* `useQuery` (fetching) and `useMutation` (creating reports).
*   **Service Layer:** `src/services/incidentService.ts`
    *   *Look for:* `axios` calls to the backend.

## 5. Database Schema (MongoDB)
**Concept:** How the data is structured in the database.
*   **Incident Schema:** `backend/src/models/Incident.ts`
    *   *Look for:* Fields like `title`, `severity`, `latitude`, `longitude`.

---

## Quick Cheat Sheet for "Show Me Code"
| If they ask about... | Open this file... |
| :--- | :--- |
| **Login Logic** | `backend/src/routes/auth.ts` |
| **Token Storage** | `src/context/AuthContext.tsx` |
| **Protecting Routes** | `src/App.tsx` |
| **Database Models** | `backend/src/models/Incident.ts` |
| **Hiding API Keys** | `backend/src/routes/proxy.ts` |
