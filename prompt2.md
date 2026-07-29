# Codex Instruction: Trust Score Calculation Algorithm Implementation for CivicKural

## Objective

Implement a multi-modal, automated **Trust Score Calculation Engine ($0.0\% - 100.0\%$)** inside `backend/src/services/AiCategorizationService.js` (and `AiCategorizationService.java` for Spring Boot).

The engine must evaluate incoming complaint submissions across 4 distinct data pillars—Image/EXIF Metadata, Geolocation & Spatial Verification, User Account Reputation, and Content Consistency—to automatically generate a composite `trustScore` float stored with every report entity.

---

## STRICT SCOPE RULE

Modify / Create ONLY:
- `backend/src/services/AiCategorizationService.js` (or `AiCategorizationService.java` in Spring Boot)
- `backend/src/controllers/reportController.js`
- `shared/types.ts`

Do NOT modify:
- Core frontend UI layout files, existing database connectivity schemas, or authentication JWT strategies.

---

## Trust Score Mathematical Model & Pillar Breakdown

The final `trustScore` is computed as a normalized weighted sum ($0 - 100$):

$$\text{Trust Score} = S_{\text{EXIF}} + S_{\text{Geo}} + S_{\text{Reputation}} + S_{\text{Consistency}}$$

---

### Pillar 1: Image & EXIF Metadata Validation (Weight: 30 Points Max)

1. **Camera EXIF Metadata Check (+15 Points):**
   - Parse image headers/metadata using an EXIF parsing library.
   - If image contains raw camera EXIF metadata (Make, Model, Exposure, ISO), award **+15 points**.
   - If image lacks EXIF data (suggesting a web download or screenshot), award **0 points**.

2. **Temporal Proximity Check (+15 Points):**
   - Extract `DateTimeOriginal` from photo EXIF.
   - Compare photo capture timestamp against server system time of submission.
   - If captured within 15 minutes of submission: **+15 points**.
   - If captured within 2 hours: **+10 points**.
   - If captured > 24 hours ago or missing timestamp: **+0 points**.

---

### Pillar 2: Geolocation & Spatial Verification (Weight: 25 Points Max)

1. **Device GPS vs. Photo EXIF Coordinate Match (+15 Points):**
   - Compare client browser/device GPS coordinates (`lat`, `lng`) with embedded EXIF GPS tags in the uploaded photo.
   - Calculate distance $d$ using the Haversine formula:
     - $d \le 50\text{ meters}$: **+15 points**.
     - $50\text{m} < d \le 500\text{m}$: **+8 points**.
     - $d > 500\text{m}$ or missing EXIF GPS: **+0 points**.

2. **Municipal Boundary Verification (+10 Points):**
   - Verify submitted coordinates fall within predefined municipal administrative bounding boxes.
   - If within valid municipal boundaries: **+10 points**.
   - If outside or invalid (e.g., $0.0, 0.0$): **+0 points**.

---

### Pillar 3: User Account Reputation & History (Weight: 25 Points Max)

1. **Authentication Level (+10 Points):**
   - Authenticated user account with verified email/phone: **+10 points**.
   - Anonymous or guest session: **+0 points**.

2. **Historical Accuracy Rate (+15 Points):**
   - Query user's past submission history in MongoDB / JPA Repository:
     - Historical Ratio $= \frac{\text{Resolved / Valid Reports}}{\text{Total Past Submissions}}$
   - If first-time user (0 past submissions): Default baseline **+10 points**.
   - If Ratio $\ge 0.8$: **+15 points**.
   - If $0.5 \le \text{Ratio} < 0.8$: **+10 points**.
   - If Ratio $< 0.5$ (high past rejected/spam count): **+0 points**.

---

### Pillar 4: Multi-Modal & Content Consistency (Weight: 20 Points Max)

1. **Voice Note Presence (+10 Points):**
   - If submission includes a live recorded audio voice note (`audioBlob`/`audioTranscript` present): **+10 points**.
   - If text-only: **+0 points**.

2. **Text Structure & Description Depth (+10 Points):**
   - Check combined description length (`title` + `description`):
     - Length $> 50$ characters with actionable keywords: **+10 points**.
     - Length between $15 - 50$ characters: **+5 points**.
     - Length $< 15$ characters (e.g., "bad", "fix this"): **+0 points**.

---

## Action Triage Rules & Flagging System

Assign a read-only `trustTier` status based on the final calculated `trustScore`:

| Trust Score Range | `trustTier` | System Action / Triage Handling |
| :--- | :--- | :--- |
| **80.0% – 100.0%** | `HIGH_INTEGRITY` | Auto-dispatched directly to target municipal department triage queue. |
| **50.0% – 79.9%** | `STANDARD` | Enters standard department evaluation queue. |
| **< 50.0%** | `LOW_TRUST_SPAM` | Flagged for manual review in Admin Panel before dispatching to field staff. |

---

## Verification & Testing Instructions

1. **High Trust Submission Test:**
   - Submit report with verified account, camera photo with EXIF metadata, matching GPS coordinates, a voice note, and detailed text (> 50 chars).
   - **Expected Outcome:** `trustScore` $\ge 85\%$, `trustTier` = `HIGH_INTEGRITY`.

2. **Low Trust / Web Image Test:**
   - Submit report with web-downloaded image (no EXIF metadata), mismatched GPS coordinates, short text (< 10 chars), and no voice note.
   - **Expected Outcome:** `trustScore` $< 40\%$, `trustTier` = `LOW_TRUST_SPAM`.