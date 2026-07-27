# Codex Instruction: Global Rebrand to "CivicKural", Attribution Cleanup & GitHub Integration

## Objective

1. Perform a complete global rebrand across the entire codebase from "Samvad" / "SamvadApp" / "Samvad Civic Connect" to **"CivicKural"**.
2. Remove all external attribution, third-party template credits, author signatures, or external repository links to establish 100% personal ownership branding under **Madhu Krishnan**.
3. Prepare and structure the repository for seamless integration with GitHub at `https://github.com/MADHU-KRISHNAN/CivicKural`.

---

## STRICT SCOPE RULE

Modify:
- `frontend/SamvadApp/`
- `backend/`
- `shared/`
- `package.json` (Root)
- `README.md` and all documentation `.md` files

Do NOT modify:
- Core business logic, existing data models, or API endpoints implemented in previous phases.

---

## Task Breakdown

### 1. Global Brand & Title Renaming
Search and update all occurrences of the old brand name ("Samvad", "SamvadApp", "samvad-civic-connect-platform") across UI headers, page titles, document titles, logos, configuration files, and package names:

- **Browser Tab & App Title:**
  - Update `frontend/SamvadApp/index.html` `<title>` to: `CivicKural — AI-Powered Civic Governance Platform`.
- **Package Identifiers:**
  - Update `package.json` names:
    - Root `package.json` -> `"name": "civickural-root"`
    - `frontend/SamvadApp/package.json` -> `"name": "civickural-frontend"`
    - `backend/package.json` -> `"name": "civickural-backend"`
- **UI Navigation & Branding:**
  - Update header logo/brand text in `App.tsx`, `LandingPage.tsx`, `LoginScreen.tsx`, `AdminDashboardPage.tsx`, and all footer sections to **CivicKural**.
- **Local Storage Keys:**
  - Update storage key strings in `frontend/SamvadApp/src/services/api.ts`, `App.tsx`, and `LoginScreen.tsx`:
    - `samvad_user` -> `civickural_user`
    - `samvad_token` / `auth_token` -> `civickural_token`
    - `samvad_demo_issues` -> `civickural_demo_issues`

---

### 2. Attribution Cleanup & Author Branding
- **Remove External Credits:** Scan all codebase comments, footers, and documentation files (`README.md`, `FULL_APPLICATION_GUIDE.md`, etc.) and delete any mentions of external authors, starter templates, or third-party boilerplate credits.
- **Set Unified Ownership:** Set all author fields across all `package.json` files to:
  ```json
  "author": "Madhu Krishnan [https://github.com/MADHU-KRISHNAN/CivicKural](https://github.com/MADHU-KRISHNAN/CivicKural)"