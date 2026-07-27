# Codex Instruction: Expand Web App Pages, Modernize UI ("Flashy" Layout), & Standardize Issue Categories

## Objective

Enhance `frontend/SamvadApp` to:
1. Transform the UI into a visually engaging, modern, and "flashy" web application using modern styling techniques (e.g., glassmorphism, subtle animations, vibrant badges, interactive cards).
2. Expand the routing structure to include a comprehensive suite of distinct pages for regular users and administrators, making it feel like a complete, feature-rich platform.
3. Strictly implement a standardized set of Issue Categories across the reporting forms, filters, and admin dashboards.

---

## STRICT SCOPE RULE

Modify ONLY:
- `frontend/SamvadApp`

Do NOT modify:
- `backend/`
- `shared/`
- `root package.json`
- `documentation/`

---

## Task 1: UI/UX Modernization ("Flashy" Setup)

### Visual Design Guidelines
- **Modern Cards & Containers:** Upgrade simple plain DIVs to styled cards with subtle drop shadows, rounded corners (`border-radius`), and hover elevation effects.
- **Interactive Feedback:** Add smooth CSS transitions for button clicks, card hover states, and navigation links. 
- **Data Visualization & Stats:** On dashboards, display key metrics using prominent "Stat Cards" (e.g., Total Issues, Pending Resolution, Resolved, Urgent Attention) with icons and colored progress bars or mini charts.
- **Status Badges:** Use vibrant, color-coded pills/badges to represent issue statuses (e.g., *Pending* in yellow/orange, *In Progress* in blue, *Resolved* in green, *Rejected* in red).
- **Empty States & Loaders:** Add visually appealing empty states (when no issues exist) and skeleton loading states or spinners for async data fetching.

---

## Task 2: Comprehensive Page & Route Expansion

Expand `react-router-dom` routes in `src/routes/` or `App.tsx` to include a full suite of pages. If placeholder components do not exist, create them in `src/pages/` with mock data or existing API hooks:

### 1. Public / Citizen Routes
- **`/` (Landing / Home Page):** A hero section explaining the Samvad platform, quick statistical highlights, and prominent call-to-action (CTA) buttons: *"Report an Issue"* and *"Explore Public Reports"*.
- **`/dashboard` (User Portal):** A personalized dashboard showing the user's submitted issues, current tracking statuses, and recent activity timelines.
- **`/report` (Issue Submission Page):** A clean, multi-step or well-organized form featuring category selection, geolocation tagging, image upload with live preview, and detailed description fields.
- **`/issues` (Community Issue Explorer):** A public feed/grid of reported issues featuring:
  - Search bar by keyword.
  - Filter dropdowns by **Category** and **Status**.
  - Sorting by *Newest*, *Most Upvoted*, or *Priority*.
- **`/issues/:id` (Detailed Issue View):** A dedicated page for a single issue showing the full description, uploaded images, location map/coordinates, resolution timeline, and community/admin comments.
- **`/profile` (User Profile):** User details, notification preferences, and history of platform engagement.

### 2. Admin & Management Routes
- **`/admin` (Admin Overview Dashboard):** A high-level control panel featuring system-wide analytics, category breakdown charts, and urgent issue alerts.
- **`/admin/issues` (Admin Issue Management Table):** A dense, data-rich table view allowing administrators to:
  - Filter and bulk-select issues.
  - Change issue status (e.g., *Assign*, *Mark In Progress*, *Resolve*).
  - Assign priority levels (*Low*, *Medium*, *High*, *Critical*).
- **`/admin/users` (User & Role Management):** A simple interface to view registered users, moderators, and departmental officers.

---

## Task 3: Mandated Issue Categories Implementation

Strictly standardize the application's issue categorization. Wherever categories are referenced (reporting forms, database mapping, UI filters, admin charts), use the following **exact 5 categories**:

1. **Sanitary & Public Hygiene**
2. **Service Delivery Deficiencies**
3. **Administrative Delays and Maladministration**
4. **Abuse of Power or Corruption**
5. **Systemic and Policy Issues**

### Implementation Requirements for Categories:
- **Report Form (`/report`):** Populate the category selection dropdown or radio buttons strictly with these 5 options. Do not allow free-text category submission.
- **Visual Mapping:** Assign distinct color codes or icons to each category so they stand out visually across the app:
  - *Sanitary & Public Hygiene:* Teal / Green badge
  - *Service Delivery Deficiencies:* Blue badge
  - *Administrative Delays and Maladministration:* Orange / Amber badge
  - *Abuse of Power or Corruption:* Red / Crimson badge
  - *Systemic and Policy Issues:* Purple / Indigo badge
- **Filtering & Analytics:** Ensure the `/issues` filter dropdown and `/admin` analytics charts group and display data accurately according to these specific 5 categories.

---

## Verification & Testing

Inside `frontend/SamvadApp`, run:
```bash
npm install
npm run dev