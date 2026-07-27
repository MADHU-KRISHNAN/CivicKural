# Codex Instruction — Phase 2: Authentication Flow & Role-Based UI Route Guards

## Objective

Build a unified, robust authentication flow in `frontend/SamvadApp` backed by the Express JWT authentication endpoints. Implement persistent session management using `localStorage` and build strict React Router guards to prevent unauthorized access to citizen, staff, or admin portals.

---

## STRICT SCOPE RULE

Modify ONLY:
- `frontend/SamvadApp/src/App.tsx`
- `frontend/SamvadApp/src/screens/LoginScreen.tsx`
- `frontend/SamvadApp/src/pages/LandingPage.tsx`
- `frontend/SamvadApp/src/services/api.ts`
- `frontend/SamvadApp/src/components/ProtectedRoute.tsx` (Create if missing)

Do NOT touch:
- `backend/`
- `shared/`
- `root package.json`

---

## Task Breakdown

### 1. Create Route Guard Component (`src/components/ProtectedRoute.tsx`)
Create a wrapper component `ProtectedRoute` to manage role-based route security:
- Check if user is authenticated (via session state or `localStorage` token).
- If unauthenticated, redirect to `/login` with a redirect query string or navigation state saving the intended destination.
- Check if `allowedRoles` (e.g., `['citizen']` or `['admin', 'staff']`) includes the active user's `role` / `userType`.
- If role authorization fails, redirect to an `/unauthorized` or `/dashboard` view with a warning notification.

---

### 2. Update React Router Setup (`src/App.tsx`)
Wrap application routes in the appropriate route guards:

- **Public Routes:**
  - `/` -> `LandingPage.tsx`
  - `/login` -> `LoginScreen.tsx`
  - `/issues` -> `CommunityIssuesPage.tsx` (Public explorer view)

- **Protected Citizen Routes (`allowedRoles={['citizen', 'admin', 'staff']}`):**
  - `/dashboard` -> `UserDashboardPage.tsx`
  - `/report` -> `ReportIssuePage.tsx`
  - `/profile` -> `ProfilePage.tsx`
  - `/issues/:id` -> `IssueDetailPage.tsx`

- **Protected Admin & Staff Routes (`allowedRoles={['admin', 'staff']}`):**
  - `/admin` -> `AdminDashboardPage.tsx`
  - `/admin/issues` -> `AdminIssuesPage.tsx`
  - `/admin/users` -> `AdminUsersPage.tsx`

---

### 3. Enhance Authentication Screen (`src/screens/LoginScreen.tsx`)
Transform `LoginScreen.tsx` into a complete, dual-mode auth screen:
- **Toggle Mode:** Support switching between **Login** and **Register**.
- **Role Selection during Register:** Allow selecting account type (`Citizen` vs `Staff/Admin`).
- **Form Validation:** Validate email format, password minimum length, and required fields.
- **API Wiring:** Call `apiService.login()` or `apiService.register()`. Save received JWT token (`auth_token`) and user object (`samvad_user`) into `localStorage`.
- **Post-Auth Navigation:** Redirect Citizens to `/dashboard` and Admins/Staff directly to `/admin`.

---

### 4. Integrate Session State in App Root (`src/App.tsx`)
- On application startup (`useEffect` on mount), verify if `auth_token` exists in `localStorage`.
- Fetch fresh user profile via `apiService.getCurrentUser()`.
- Provide a global logout function that clears `localStorage` tokens and resets application state to redirect to `/login`.
- Update the top navigation header to dynamically display the active user's name, role badge, and context-aware action buttons (*"Admin Dashboard"*, *"Report Issue"*, *"Logout"*).

---

## Final Testing & Verification

1. **Unauthenticated Redirect Check:**
   - Open a fresh browser window in private/incognito mode.
   - Navigate directly to `http://localhost:5173/admin` or `http://localhost:5173/report`.
   - **Expected Outcome:** The app immediately redirects to `/login`.

2. **Citizen Auth Check:**
   - Log in or register as a `citizen`.
   - Attempt to navigate to `http://localhost:5173/admin`.
   - **Expected Outcome:** Access is blocked, and user is redirected to `/dashboard`.

3. **Admin Auth Check:**
   - Log in as an `admin` or `staff`.
   - Navigate to `/admin`, `/admin/issues`, and `/admin/users`.
   - **Expected Outcome:** All admin panels load smoothly with full administrative privileges.