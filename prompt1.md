# Codex Instruction: Multi-Citizen Trust Score Refinement & Incremental Clustering Engine for CivicKural

## Objective

Update the Trust Score calculation engine in `backend/src/services/TrustScoreService.js` (or Java equivalent) and `backend/src/services/ReportService.js` to implement a multi-layered verification algorithm. 

The system must factor in:
1. Citizen Historical Reputation (Past report accuracy).
2. Deep Vision AI Verification (Real photo vs. AI-generated image check + Scene-to-Text relevancy match).
3. Geospatial & Temporal Duplicate Clustering (Automatic Trust Boost for multi-citizen validation).

Additionally, implement logic so that when multiple citizens file the same issue at the same location, the existing complaint's Trust Score increases dynamically with each new submission.

---

## STRICT SCOPE RULE

Modify / Refactor ONLY:
- `backend/src/services/TrustScoreService.js` (or `.java`)
- `backend/src/services/ReportService.js` (or `.java`)
- `backend/src/models/Report.js` (or Schema definition)
- `shared/types.ts`

Do NOT break or modify frontend API payload contracts or existing authentication middleware.

---

## Task Breakdown & Technical Specifications

### 1. Enhanced Trust Score Mathematical Model

Implement the dynamic Trust Score formula:

$$\text{Final Trust Score} = \min(100, \text{Base Score} + \text{Reputation Weight} + \text{AI Vision Score} + \text{Multi-Citizen Boost} - \text{Penalties})$$

#### Core Evaluation Factors:
- **A. Past Report History (Reputation Factor):**
  - Fetch reporter's history. 
  - If `user.resolvedReportsCount > 3` and `fakeReportCount === 0` $\rightarrow$ Add **+10%**.
  - If `user.fakeReportCount > 0` $\rightarrow$ Deduct **-25%**.
  - New users start at neutral weight ($0\%$).

- **B. AI Visual Authenticity & Relevancy Check:**
  - **Real vs. AI/Stock Detection:** Scan image metadata/visual artifacts. If flagged as AI-generated or stock photo $\rightarrow$ Set score cap at $30\%$ and mark `isSuspiciousImage: true`.
  - **Image-to-Text Match:** Verify image labels match complaint text (e.g., text mentions "garbage", image contains "waste/trash") $\rightarrow$ Add **+15%**.

- **C. Multi-Citizen Spatial Clustering & Incremental Trust Boost:**
  - When a report is submitted, query existing active reports within a **50-meter radius** created within the last 72 hours with matching category/intent.
  - **First Citizen Submission:** Base score calculated normally (e.g., $85\%$).
  - **Second Citizen Submission (Same location, different user ID):** 
    - Link second submission to the primary cluster.
    - Increment the primary complaint's Trust Score by **+7%** (e.g., $85\% \rightarrow 92\%$).
    - Increase `upvoteCount` / `clusterCount` by $+1$.
  - **Third+ Citizen Submission:**
    - Increment primary complaint's Trust Score by **+6%** (up to a max of $100\%$).

---

## 2. API & Mock Data Testing Logic

Modify the POST `/api/reports` handler to automatically test this behavior:

```typescript
// Algorithm Logic for New Report Submission
async function processReportSubmission(newReport) {
  // 1. Check for nearby identical complaints (within 50 meters, same category)
  const nearbyCluster = await Report.findOne({
    location: {
      $near: {$geometry: { type: "Point", coordinates: [newReport.longitude, newReport.latitude] },
        $maxDistance: 50 // meters
      }
    },
    category: newReport.category,
    status: { $ne: "RESOLVED" }
  });

  if (nearbyCluster && nearbyCluster.userId !== newReport.userId) {
    // Multi-citizen validation triggered!
    const updatedTrustScore = Math.min(100, nearbyCluster.trustScore + 7);
    
    await Report.findByIdAndUpdate(nearbyCluster._id, {
      trustScore: updatedTrustScore,
      $inc: { multiCitizenConfirmations: 1 },$push: { secondaryReporters: newReport.userId }
    });

    return {
      message: "Report merged with existing issue cluster. Trust Score boosted!",
      primaryReportId: nearbyCluster._id,
      newTrustScore: updatedTrustScore
    };
  }

  // 2. Otherwise, calculate single-reporter base Trust Score
  const baseScore = calculateBaseTrustScore(newReport);
  return await Report.create({ ...newReport, trustScore: baseScore });
}