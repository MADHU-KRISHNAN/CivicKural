# Codex Instruction: AI Image Authenticity Verification & Dynamic Trust Score Integration

## Objective

Extend the verification pipeline across `CivicKural` to detect fake, web-scraped, stock, or AI-generated images submitted by citizens. Automatically adjust the report's **Trust Score** based on visual/metadata analysis and display the verification badges on the Admin Command Center.

---

## STRICT SCOPE RULE

Modify ONLY:
- `shared/types.ts`
- `backend/src/models/Report.js`
- `backend/src/services/TrustScoreService.js`
- `backend/src/controllers/reportController.js`
- `frontend/CivicKuralApp/src/pages/AdminIssuesPage.tsx`
- `frontend/CivicKuralApp/src/components/`

Do NOT break existing MongoDB geo-spatial queries or user authentication tokens.

---

## Technical Specifications & Architecture

### 1. Schema & Type Extensions (`shared/types.ts`)
```typescript
export interface ImageAuthenticityDetails {
  hasExifData: boolean;
  isAiGenerated: boolean;
  isWebDuplicate: boolean;
  authenticityScore: number;
  flags: string[];
  cameraModel?: string;
}

export interface Issue {
  imageAuthenticity?: ImageAuthenticityDetails;
}
```

### 2. Enhanced Image Authenticity Pipeline (`TrustScoreService.js`)
- **EXIF Check:** Valid EXIF GPS matching coordinates $\rightarrow$ **+15% Boost** (`"EXIF_MATCH"`). Missing EXIF $\rightarrow$ **-10% Penalty** (`"METADATA_MISSING"`).
- **AI / Stock Photo Penalty:**
  - `isAiGenerated === true` $\rightarrow$ Cap max Trust Score at **20%**, apply **-40% penalty**, flag `"AI_SYNTHETIC_FLAG"`.
  - `isWebDuplicate === true` $\rightarrow$ Cap max Trust Score at **30%**, apply **-35% penalty**, flag `"WEB_DUPLICATE_FLAG"`.

### 3. Frontend Admin Integration (`AdminIssuesPage.tsx`)
- Display diagnostic badges: 🟢 **`Camera Verified`**, 🟡 **`Metadata Missing`**, 🔴 **`Suspected Fake / AI Image`**.
- Add **Visual Verification Audit Box** in Issue Detail Drawer showing authenticity scores and active flags.

---

## Verification & Build Plan

1. Execute build test: `npm run build`.
2. Test submitting report with `mockAiGenerated: true` $\rightarrow$ Verify score caps at 20% and receives `🔴 Suspected Fake / AI Image` badge on Admin Dashboard.
