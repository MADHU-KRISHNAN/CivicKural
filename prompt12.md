# Codex Instruction — Phase 1: Data Model Alignment, Schema Synchronization, & API Patching

## Objective

Fix data structure discrepancies between the Node.js/Express Mongoose models and the React Vite frontend types, enforce the strict 5 civic categories, align priority/role enums, add missing endpoints (`GET /api/users`), and prepare the schema for AI scoring fields without breaking existing functionality.

---

## STRICT SCOPE RULE

Modify ONLY:
- `shared/types.ts`
- `backend/src/models/User.js`
- `backend/src/models/Report.js`
- `backend/src/controllers/reportController.js`
- `backend/src/controllers/authController.js`
- `backend/src/routes/auth.js`
- `frontend/SamvadApp/src/services/api.ts`

Do NOT touch:
- `root package.json`
- `railway.toml`

---

## Task Breakdown

### 1. Synchronize Shared Types (`shared/types.ts`)
Update the TypeScript contracts to align with the backend Mongoose models:

- **Category Enum:** Lock down the strict 5 categories:
  ```typescript
  export type IssueCategory = 
    | 'Sanitary & Public Hygiene'
    | 'Service Delivery Deficiencies'
    | 'Administrative Delays and Maladministration'
    | 'Abuse of Power or Corruption'
    | 'Systemic and Policy Issues';