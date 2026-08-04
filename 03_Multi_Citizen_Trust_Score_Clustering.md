# Codex Instruction: Multi-Citizen Trust Score Refinement & Incremental Clustering Engine

## Objective

Update the Trust Score calculation engine in `backend/src/services/TrustScoreService.js` and `backend/src/services/ReportService.js` to implement a multi-layered verification algorithm.

The system must factor in:
1. Citizen Historical Reputation (Past report accuracy).
2. AI Vision Verification (Real photo vs. AI-generated image check + Scene-to-Text relevancy match).
3. Geospatial & Temporal Duplicate Clustering (Automatic Trust Boost for multi-citizen validation).

---

## STRICT SCOPE RULE

Modify / Refactor ONLY:
- `backend/src/services/TrustScoreService.js`
- `backend/src/services/ReportService.js`
- `backend/src/models/Report.js`
- `shared/types.ts`

Do NOT break or modify frontend API payload contracts or existing authentication middleware.

---

## Technical Specifications

### 1. Dynamic Trust Score Calculation

Formula:
$$\text{Final Trust Score} = \min(100, \text{Base Score} + \text{Reputation Weight} + \text{AI Vision Score} + \text{Multi-Citizen Boost} - \text{Penalties})$$

#### Core Factors:
- **Reputation Weight:** User resolved count > 3 and 0 fake reports $\rightarrow$ **+10% Boost**. User has fake reports $\rightarrow$ **-25% Penalty**.
- **Multi-Citizen Boost:** When a report is submitted within 50 meters of an active ticket (same category, created in last 72 hours):
  - Link submission to primary cluster.
  - Increment primary complaint's Trust Score by **+7%** (e.g., $85\% \rightarrow 92\% \rightarrow 98\%$).
  - Increment `multiCitizenConfirmations` counter.

---

## Verification Check

1. Run test script:
   ```bash
   node backend/scripts/test_trust_score_boost.js
   ```
2. Verify duplicate reports from distinct citizens gracefully boost the primary ticket's Trust Score while avoiding duplicate tickets on the Admin Dashboard.
