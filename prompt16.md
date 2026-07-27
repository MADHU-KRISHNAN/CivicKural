# Codex Instruction — Phase 5: Flashy Admin Control Panel, Leaflet Heatmaps & Recharts Analytics

## Objective

Overhaul and modernize the administrative portal in `frontend/SamvadApp/src/pages/admin/` (`AdminDashboardPage.tsx`, `AdminIssuesPage.tsx`, `AdminUsersPage.tsx`). Transform it into a dark-mode, glassmorphic executive control center featuring live Leaflet.js heatmaps/markers, Recharts predictive trend visuals, dynamic multi-filter triage tables, and resolution proof management.

---

## STRICT SCOPE RULE

Modify ONLY:
- `frontend/SamvadApp/src/pages/admin/AdminDashboardPage.tsx`
- `frontend/SamvadApp/src/pages/admin/AdminIssuesPage.tsx`
- `frontend/SamvadApp/src/pages/admin/AdminUsersPage.tsx`
- `frontend/SamvadApp/src/components/` (Create administrative widgets if needed)
- `frontend/SamvadApp/src/services/api.ts`

Do NOT touch:
- `backend/`
- `shared/`
- `root package.json`

---

## Task Breakdown

### 1. Executive Dashboard Overview (`src/pages/admin/AdminDashboardPage.tsx`)
Create a visually rich, glassmorphic analytics center:
- **Stat Cards:** Render high-impact metric cards displaying:
  - *Total Complaints Received*
  - *High-Priority Emergency Alerts* (Issues with `priorityScore > 75`)
  - *Resolution Rate %*
  - *Average SLA Resolution Time*
- **Predictive Analytics (Recharts):**
  - **Surge Forecast Line/Area Chart:** Plot historic grievance volume vs. projected 30-day municipal bottleneck surges.
  - **Category Breakdown Pie/Donut Chart:** Render issue distribution strictly across the 5 civic categories:
    1. `Sanitary & Public Hygiene`
    2. `Service Delivery Deficiencies`
    3. `Administrative Delays and Maladministration`
    4. `Abuse of Power or Corruption`
    5. `Systemic and Policy Issues`

---

### 2. Interactive Municipal Risk Heatmap (`AdminDashboardPage.tsx` / `MapView.tsx`)
Integrate Leaflet.js map containers pinned over city boundaries:
- **Color-Coded Status Pins & Heat Clusters:**
  - Red markers = Critical / High Priority (`priorityScore >= 70`)
  - Orange/Yellow markers = Medium Priority (`40 <= priorityScore < 70`)
  - Green markers = Resolved issues
- **Interactive Tooltip Popup:** Clicking a marker displays issue title, 3-tier department assignment (`Tier 2`), trust score badge, priority score, and a quick-action button to view/reassign.

---

### 3. Triage & Dispatch Table (`src/pages/admin/AdminIssuesPage.tsx`)
Build a dense, feature-packed administration table:
- **Default Priority Sorting:** Ensure table rows automatically order by `priorityScore` descending.
- **Visual Badges:** Display `Trust Score` ($0.0 - 1.0$), `Priority Score` ($0 - 100$), `3-Tier Department Hierarchy`, and status pills.
- **Supervisory Reassignment & Manual Override:** Allow admins to manually override and reassign departments if the AI classification needs correction.
- **Resolution Proof Upload:** Mandate upload of resolution details and completion media before marking a ticket as `Resolved`.

---

### 4. Staff & User Management (`src/pages/admin/AdminUsersPage.tsx`)
- Populate the user database directly using `apiService.getUsers()`.
- Filter users by role (`Citizen`, `Staff`, `Admin`) and department assignment.
- Provide toggle actions to adjust user authorization or active status.

---

## Final Testing & Verification

1. **Dashboard UI Check:**
   - Log in as an Admin and navigate to `/admin`.
   - Confirm Recharts graphs render smoothly without flickering or layout overflowing.

2. **Heatmap Inspection:**
   - Verify issues with coordinates display as color-coded pins on the Leaflet map.
   - Click a pin to ensure the issue detail tooltip opens correctly.

3. **Triage & Override Test:**
   - Open `/admin/issues`. Confirm highest `priorityScore` tickets appear at the top.
   - Manually change an issue's status or assigned department, and verify the backend state updates.