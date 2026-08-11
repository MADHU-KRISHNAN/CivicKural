# Codex Instruction: Implementation of Resolution Verification System for CivicKural

## Objective

Implement a multi-stage **Resolution Verification System** for report lifecycles in `CivicKural`. Instead of staff members simply toggling an issue status to `Resolved`, they must submit proof (image proof + completion notes). The issue will transition to a new intermediate status `PENDING_VERIFICATION` until an Admin or the original Citizen reporter verifies and approves the proof.

---

## STRICT SCOPE RULE

Modify ONLY:
- `shared/types.ts`
- `backend/src/models/Report.js`
- `backend/src/routes/reports.js`
- `backend/src/controllers/reportController.js`
- `frontend/CivicKuralApp/src/services/api.ts`
- `frontend/CivicKuralApp/src/pages/IssueDetailPage.tsx`

Do NOT break existing authentication middleware, map rendering components, or database connection instances.

---

## Technical Specifications & Architecture

### 1. Schema Updates (`shared/types.ts` & `Report.js`)
- Add `PENDING_VERIFICATION` to `IssueStatus`.
- Add `resolutionProof` (`proofImageUrl`, `notes`, `submittedBy`, `submittedAt`).
- Add `verificationDetails` (`verifiedBy`, `verifiedAt`, `status`, `feedbackNotes`).

### 2. Backend API Endpoint Implementation
- `POST /api/reports/:id/submit-proof` (Staff Only): Validates status is `IN_PROGRESS`, saves proof object, updates status to `PENDING_VERIFICATION`.
- `POST /api/reports/:id/verify-resolution` (Admin or Reporting Citizen):
  - If approved $\rightarrow$ Sets status to `RESOLVED`, updates `verificationDetails`.
  - If rejected $\rightarrow$ Reverts status to `IN_PROGRESS`, saves feedback notes.

### 3. Frontend Implementation (`IssueDetailPage.tsx`)
- **Staff View:** When `IN_PROGRESS`, render "Submit Proof of Resolution" form.
- **Admin / Reporting Citizen View:** When `PENDING_VERIFICATION`, show proof image + notes with **Approve** and **Reject** buttons.

---

## Verification Plan

1. Log in as Staff $\rightarrow$ Submit proof $\rightarrow$ Verify status updates to `PENDING_VERIFICATION`.
2. Log in as Citizen or Admin $\rightarrow$ Review proof $\rightarrow$ Click Approve $\rightarrow$ Verify status updates to `RESOLVED`.
