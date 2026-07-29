# Codex Instruction: Combined DistilBERT Automated Categorization & Spring Boot Migration for CivicKural

## Objective

This single, comprehensive instruction set guides the transformation of **CivicKural** to:
1. **Automate Issue Categorization (NLP & STT):** Eliminate manual category pickers on the frontend by auto-detecting the exact civic category using a DistilBERT NLP classifier that evaluates plain text and/or transcribed voice notes.
2. **Migrate Backend to Spring Boot 3.x (Java 17+):** Replicate the REST backend infrastructure in Spring Boot while keeping all React REST API endpoints, DTO models, JWT security, and AI pipeline interfaces completely intact.

---

## STRICT SCOPE RULE

Modify / Create:
- `frontend/CivicKuralApp/src/pages/ReportIssuePage.tsx` (Remove manual category selection UI)
- `backend/` (Migrate Node.js service to Spring Boot Java 17+ architecture)
- `shared/types.ts` (Synchronize TypeScript interfaces with Spring Boot DTOs)

Do NOT modify:
- Core React route paths or authentication token handling logic in `frontend/CivicKuralApp/`.

---

# SECTION A: Automated Issue Categorization via DistilBERT NLP & Speech-to-Text

### 1. Frontend Intake Simplification (`ReportIssuePage.tsx`)
- **Remove Manual Category Picker:** Delete category dropdowns or radio button groups. Citizens do not manually choose categories.
- **AI Auto-Detection Visual Indicator:** Render a read-only visual status badge: `🤖 Category: Auto-detected by AI upon submission`.
- **Form Submission Payload:** Send raw `description`, `title`, `audioBlob` (if recorded), and `location`. The `category` parameter is dynamically populated on the server upon processing.

### 2. DistilBERT NLP Classification & Speech-to-Text Pipeline
- **Speech-to-Text Processing:** Automatically convert uploaded audio voice notes into clean plain-text transcripts.
- **Mandated Category Mapping:** The NLP classifier evaluates combined text (`title` + `description` + `audioTranscript`) and assigns **strictly one** of the 5 mandated civic categories:
  1. `Sanitary & Public Hygiene` (garbage, sewage, trash, dump, waste, drainage, odor, public toilet)
  2. `Service Delivery Deficiencies` (water cut, street lights off, low pressure, bus delay, power outage, electricity)
  3. `Administrative Delays and Maladministration` (pending application, certificate delay, office negligence, file stuck)
  4. `Abuse of Power or Corruption` (bribe, extortion, misconduct, official abuse, fraud, favoritism)
  5. `Systemic and Policy Issues` (bad road design, dangerous intersection, policy flaw, city planning failure)
- **Output Properties:** Returns `predictedCategory`, `confidenceScore` ($0.0 - 1.0$), and derived 3-tier routing hierarchy (`Tier 1`, `Tier 2`, `Tier 3`).

---

# SECTION B: Spring Boot 3.x Backend Migration Architecture

### 1. Layered Project Structure
Organize `backend/src/main/java/com/civickural/` as follows: