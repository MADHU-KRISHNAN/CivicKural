# Codex Instruction — Phase 4: Simulated AI Backend Pipeline, 3-Tier Categorization & Dynamic Priority Scoring

## Objective

Implement the simulated AI decision-making pipeline on the Express backend (`backend/src/`). This engine will process incoming unstructured grievance reports (text, voice transcripts, photos, and GPS coordinates) to automatically perform 3-tier hierarchical categorization, vector embedding generation, Cosine Distance duplicate detection, EXIF trust scoring, and dynamic mathematical priority calculation.

---

## STRICT SCOPE RULE

Modify ONLY:
- `backend/src/controllers/reportController.js`
- `backend/src/services/aiPipeline.js` (Create if missing)
- `backend/src/models/Report.js`
- `shared/types.ts`

Do NOT touch:
- `frontend/SamvadApp/`
- `root package.json`
- `railway.toml`

---

## Task Breakdown

### 1. Build the AI Pipeline Engine (`backend/src/services/aiPipeline.js`)
Create a dedicated modular service to run simulated NLP and forensic heuristics:

#### A. 3-Tier Categorization & Vector Embedding Engine
- **3-Tier Mapping:** Map incoming category selections and keyword signals into a strict 3-tier hierarchy:
  - *Tier 1 (Macro Domain):* e.g., `Infrastructure`, `Public Health & Sanitation`, `Governance & Administration`
  - *Tier 2 (Target Department):* e.g., `Public Works Department (PWD)`, `Sanitation Board`, `Anti-Corruption Cell`
  - *Tier 3 (Sub-Category):* e.g., `Road Damage / Pothole`, `Garbage Accumulation`, `Bribery / Abuse`
- **768-Dim Vector Generator:** Generate a deterministic 768-dimensional mock vector embedding based on text content hash/seed (simulating a DistilBERT embedding).

#### B. Cosine Distance Duplicate Detection
- Calculate the Cosine Similarity / Cosine Distance between vector embeddings of tickets within a 200-meter geospatial radius.
- **Threshold Rule:** If similarity score $> 0.85$ (85% match):
  - Mark the new submission as a `duplicate`.
  - Increment the `upvotes` counter on the existing master ticket.
  - Link the new ticket as a child reference rather than creating a separate active dispatch item.

#### C. EXIF Forensic Trust Scoring
- Calculate a composite **Trust Score** ($0.0 - 1.0$):
  - Check photo metadata or payload flags for original camera EXIF tags (e.g., camera model, timestamp, GPS tags).
  - Deduct score if photo lacks EXIF tags or if photo GPS coordinates deviate significantly from the device hardware GPS ($> 500$ meters).
  - Default trust score: `0.95` for verified camera uploads; `0.40` for unverified/scraped images.

#### D. Dynamic Mathematical Priority Scoring
Calculate the final ticket **Priority Score** ($0.0 - 100.0$) using the formula:

$$\text{Priority Score} = w_1(\text{NLP Severity}) + w_2(\text{Community Upvotes}) + w_3(\text{Historical Area Risk})$$

- **Weights:** $w_1 = 0.5$, $w_2 = 0.3$, $w_3 = 0.2$.
- **Linguistic Severity ($w_1$):** Scan text for emergency/danger keywords (e.g., *"collapse"*, *"flooding"*, *"sparking wire"*, *"hazard"*, *"outrage"* = $90-100$; routine issues = $20-40$).
- **Upvote Factor ($w_2$):** Scale upvote count dynamically ($\min(upvotes \times 10, 100)$).
- **Historical Area Risk ($w_3$):** Assign a random/stored risk weight ($0-100$) based on location density.

---

### 2. Integrate AI Pipeline into Report Controller (`backend/src/controllers/reportController.js`)
Update the `createReport` and `getReports` functions:
- When `POST /api/reports` is invoked:
  1. Pass the report body through `aiPipeline.processReport()`.
  2. Save generated fields (`priorityScore`, `trustScore`, `tier1`, `tier2`, `tier3`, `vectorEmbedding`, `isDuplicate`, `masterTicketId`) into MongoDB.
- Update `getReports` to allow sorting tickets by `priorityScore` descending (so urgent issues float to the top for admins).

---

## Final Testing & Verification

1. **AI Field Generation Test:**
   - POST a report with text: *"Emergency! Structural collapse and open live wire near school."*
   - Verify the returned response contains high `priorityScore` ($> 75$), high `urgencyScore`, and correct 3-tier categorization.

2. **Duplicate Detection Test:**
   - POST two identical reports within the same GPS coordinates.
   - Confirm the second report increments `upvotes` on the first report or marks `isDuplicate: true`.

3. **Priority Ordering Check:**
   - Fetch `GET /api/reports?sort=priorityScore`.
   - Confirm critical issues are prioritized over routine complaints.