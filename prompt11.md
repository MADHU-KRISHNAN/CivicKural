# Instructions: Analyze & Extract Existing Application Structure

## Objective
Scan and document the current project structure for `SamvadApp` (both frontend and backend). The goal is to produce a detailed blueprint of all existing files, data schemas, API routes, and dependencies so we can integrate new features without breaking existing code.

---

## Output Requirements

Please inspect the workspace and generate a structured summary covering the following four sections:

### 1. Directory & File Map
Provide a complete folder tree highlighting key directories and files:
- `frontend/SamvadApp/` (Components, pages, navigation, assets, configuration files)
- `backend/` (Models, routes, database configurations, services, dependencies)
- Any shared folders or root-level configuration files (`package.json`, `requirements.txt`, `docker-compose.yml`, etc.)

---

### 2. Frontend Inventory
List the current frontend setup details:
- **Core Dependencies:** Main packages listed in `package.json` (React/React Native version, UI libraries, state management, router, etc.).
- **Pages / Screens:** Existing screens or page components and their respective file paths.
- **Routing & Auth:** Current navigation setup (React Navigation or React Router) and how user authentication state is held.
- **API Utilities:** Existing service files, Axios instances, or fetch wrappers used to make backend calls.

---

### 3. Backend & Database Inventory
List the current backend setup details:
- **Framework & Dependencies:** Python framework (FastAPI/Flask/Django) or Node.js framework and main dependencies.
- **Database Schemas / Models:** Existing database tables, ORM models (SQLAlchemy, SQLModel, Prisma, etc.), or mock datasets.
- **API Endpoints:** List all defined API routes (e.g., `POST /api/login`, `GET /api/issues`, `POST /api/report`).

---

### 4. Known Gaps & Placeholders
Identify what is missing or marked as TODO relative to our target architecture:
- Missing database tables or schema fields.
- Hardcoded mock data currently being used in place of live API calls.
- Missing routes or utility functions needed for geolocation, audio recording, or admin features.

---

## Final Goal
Use this generated blueprint to allow seamless generation of accurate, non-destructive code patches for Phase 1 (Database & FastAPI setup) and Phase 2 (Authentication & Route Guards).