# Specification & Implementation Prompt: CivicKural SLA Forecasting & Staff Hierarchy Escalation System

## Project Context
You are working on **CivicKural**, a full-stack civic grievance platform. 

### Key Project Architecture Reference:
* **Root Directory (`CivicKural/`):** Contains `sla_model_weights.json` (the trained ML SLA model payload).
* **Backend (`CivicKural/backend/src/`):** Node.js Express architecture with MongoDB (`Report.js` model for issues, `User.js` model for users/staff).
* **Frontend (`CivicKural/frontend/CivicKuralApp/src/`):** Vite + React + TypeScript app containing pages like `UserDashboardPage.tsx`, `IssueDetailPage.tsx`, and `StaffTasksPage.tsx`.

---

## Core Objectives

We need to implement an automated **SLA Resolution Forecasting Engine** and a **Hierarchical Staff Escalation System** using our trained ML weights payload (`sla_model_weights.json`).

---

## Technical Specifications

### 1. SLA Forecast Calculation Engine (Backend)

* **Model File Path:** `./sla_model_weights.json` (at project root).
* **Service Module:** `backend/src/services/slaEngineService.js`

#### Logic:
1. When a citizen submits a new report via `reportController.js`:
   * The `slaEngineService.js` reads `./sla_model_weights.json`.
   * It matches the report's `category` against `category_base_sla_hours`.
   * If the category is unlisted, it falls back to `overall_median_hours` (or `overall_average_hours`).
   * **Dynamic Modifiers:**
     * If the citizen's Trust Score $\ge 80\%$, reduce predicted duration by $15\%$.
     * If community upvotes $> 5$, reduce predicted duration by an additional $10\%$.
   * Compute expected resolution timestamp:
     $$\text{expectedResolutionDate} = \text{createdAt} + (\text{calculatedSlaHours} \times 3600 \times 1000)$$
   * Store `sla.forecastedHours` and `sla.expectedResolutionDate` inside the database record.

---

### 2. Staff Hierarchy & Role Structure (`backend/src/models/User.js`)

Ensure the `User` model supports municipal roles and supervisor hierarchy:
* **Roles:** `'CITIZEN'`, `'STAFF_TIER_1'` (Field Staff), `'STAFF_TIER_2'` (Ward Officer/Supervisor), `'ADMIN'` (Commissioner).
* **Hierarchy Link:** Each `STAFF_TIER_1` user has a `supervisorId` pointing to a `STAFF_TIER_2` user.

---

### 3. Real-Time SLA Monitoring & Auto-Escalation (`backend/src/services/escalationCron.js`)

* **Scheduler:** Implement a `node-cron` background job running every 5 minutes.
* **Breach Condition:** Query for pending reports (`status !== 'RESOLVED'`) where `sla.expectedResolutionDate < new Date()` AND `sla.isBreached === false`.
* **Execution Actions:**
  1. Set `sla.isBreached = true` and `sla.breachedAt = new Date()`.
  2. Escalate `priority` to `'CRITICAL'`.
  3. Increment `sla.escalationLevel` (from `0` $\rightarrow$ `1`).
  4. Dispatch a real-time notification (via Socket.io / SSE) to:
     * **Assigned Field Staff (`STAFF_TIER_1`):** *"URGENT: SLA breached for Report #[ID]. Priority escalated to CRITICAL."*
     * **Direct Supervisor (`STAFF_TIER_2`):** *"ESCALATION ALARM: Field Staff [Name] has missed the SLA for Report #[ID]. Action required."*

---

### 4. Database Schema Update (`backend/src/models/Report.js`)

Update `Report.js` to include the following schema extensions:

```javascript
// Add inside backend/src/models/Report.js
sla: {
  forecastedHours: { type: Number, required: true, default: 24 },
  expectedResolutionDate: { type: Date, required: true },
  isBreached: { type: Boolean, default: false },
  breachedAt: { type: Date },
  escalationLevel: { type: Number, default: 0 } // 0: Standard, 1: Supervisor Escalated, 2: Admin Escalated
},
priority: {
  type: String,
  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  default: 'MEDIUM'
},
assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }