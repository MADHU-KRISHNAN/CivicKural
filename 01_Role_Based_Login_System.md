# Codex Instruction: Role-Based Login System Restructuring for CivicKural

## Objective

Refactor `frontend/CivicKuralApp/src/screens/LoginScreen.tsx` (or `LoginPage.tsx`) to feature an explicit 3-tier Role-Based Portal Selector (`Citizen`, `Staff`, and `Admin`). Users will select their target portal via visual tabs or cards before entering credentials or executing demo logins.

---

## STRICT SCOPE RULE

Modify / Refactor ONLY:
- `frontend/CivicKuralApp/src/screens/LoginScreen.tsx` (or `LoginPage.tsx`)
- `frontend/CivicKuralApp/src/services/auth.ts` (if demo credential helpers are stored here)

Do NOT break:
- Existing AuthContext state providers, JWT token storage in `localStorage`, or route guards in `AppRoutes.tsx`.

---

## Component Refactoring Specifications

### 1. State Management
Add a role selection state:
```typescript
type UserRole = 'citizen' | 'staff' | 'admin';
const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
```

### 2. UI Layout & Styling (Enterprise Design System)
Replace generic login inputs with a structured 3-part layout:

- **Portal Selector Tabs (Top Segment):**
  - Render 3 tab pills: `Citizen Portal`, `Staff Portal`, and `Admin Portal`.
  - Style active tabs with high contrast and subtle semantic badges (e.g., Navy/Blue for Admin, Emerald/Green for Staff, Neutral Slate for Citizen).

- **Role-Aware Portal Description Banner:**
  - Display dynamic contextual guidance based on `selectedRole`:
    - **Citizen:** *"Report community issues, upload proof, and track resolution progress."*
    - **Staff:** *"View assigned ward tickets, upload work proof, and update status."*
    - **Admin:** *"City-wide dispatch, user management, SLA analytics, and proof arbitration."*

- **Dynamic Demo Login Button:**
  - Update `handleDemoLogin` to automatically trigger login for the active `selectedRole`:
    ```typescript
    const handleDemoLogin = async () => {
      const demoCredentials = {
        citizen: { email: 'citizen@civickural.org', password: 'demoPassword123' },
        staff: { email: 'staff.ward91@civickural.org', password: 'demoPassword123' },
        admin: { email: 'admin.central@civickural.org', password: 'demoPassword123' }
      };
      await login(demoCredentials[selectedRole]);
    };
    ```

### 3. Post-Login Routing Logic
After successful login, route the user dynamically according to their authenticated role:
- **`citizen`** $\rightarrow$ Navigate to `/dashboard` or `/report`
- **`staff`** $\rightarrow$ Navigate to `/staff/tasks` or `/admin/issues`
- **`admin`** $\rightarrow$ Navigate to `/admin/dashboard`

---

## Verification Check

1. Execute build:
   ```bash
   npm run build
   ```
2. Open `/login` in your browser.
3. Test clicking through all 3 role tabs (`Citizen`, `Staff`, `Admin`).
4. Execute `Demo Login` for each tab and verify that:
   - `Citizen` redirects to Citizen Dashboard.
   - `Staff` redirects to Field Staff Task View.
   - `Admin` redirects to Municipal Central Dashboard.
