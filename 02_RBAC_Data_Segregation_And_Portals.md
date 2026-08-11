# Codex Instruction: Strict RBAC Data Segregation & Distinct Portal UIs Implementation

## Objective

Restructure the backend handlers in `reportController.js` and frontend pages across `CivicKural` to enforce strict data partitioning and role-specific user portals (`ADMIN`, `STAFF`, `CITIZEN`).

---

## STRICT SCOPE RULE

Modify ONLY:
- `backend/src/controllers/reportController.js`
- `frontend/CivicKuralApp/src/pages/StaffTasksPage.tsx` (NEW)
- `frontend/CivicKuralApp/src/pages/CommunityIssuesPage.tsx`
- `frontend/CivicKuralApp/src/App.tsx`
- `frontend/CivicKuralApp/src/components/ProtectedRoute.tsx` (or equivalent route guard)

Do NOT break authentication JWT generation or MongoDB connection scripts.

---

## Technical Specifications & Codebase Refactoring

### 1. Backend Data Segregation (`backend/src/controllers/reportController.js`)
Refactor `exports.getReports` to filter automatically based on `req.user.role`:
- **CITIZEN:** `queryFilter = { userId: req.user.id }` (Only see self-authored reports).
- **STAFF:** `queryFilter = { $or: [{ assignedStaffId: req.user.id }, { department: req.user.department, assignedStaffId: null }] }`
- **ADMIN:** `queryFilter = {}` (Unfiltered, city-wide access).

Strictly enforce that status overrides (`PUT /api/reports/:id/status`) respond with `403 Forbidden` if `req.user.role !== 'ADMIN'`.

### 2. Staff Field Operations Portal (`StaffTasksPage.tsx`)
Create a new mobile-friendly page at `/staff`:
- Render a list of assigned task cards showing location, description, and status pill.
- Provide a modal for Staff to attach completion proof (photo upload + notes).
- Transition ticket status exclusively to `PENDING_VERIFICATION` upon submission.

### 3. Citizen Experience (`CommunityIssuesPage.tsx`)
- Rename page heading from "Community Grievance Explorer" to **"My Grievances"**.
- Render only reports authored by the logged-in citizen with clean empty-state fallback when no reports exist.

### 4. Router Adjustments (`App.tsx`)
- Wrap `/admin` with `allowedRoles={['ADMIN']}`.
- Wrap `/staff` with `allowedRoles={['STAFF']}`.
- Redirect Staff users automatically to `/staff` upon login.

---

## Verification & Build Plan

1. Execute build test:
   ```bash
   npm run build
   ```
2. Log in as **Citizen** $\rightarrow$ Verify `/community-issues` shows "My Grievances" with only self-authored reports.
3. Log in as **Staff** $\rightarrow$ Verify automatic redirect to `/staff` mobile task portal; confirm proof submission transitions status to `PENDING_VERIFICATION`.
4. Log in as **Admin** $\rightarrow$ Verify full city-wide visibility and override authority on `/admin`.
