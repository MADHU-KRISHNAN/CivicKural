# Codex Instruction — Phase 3: Citizen Multimodal Intake, Voice Notes, GPS & Offline IndexedDB Sync

## Objective

Enhance `frontend/SamvadApp` to provide a resilient, multimodal citizen issue reporting interface (`ReportIssuePage.tsx` / `ReportIssueScreen.tsx`). Implement audio voice note recording, browser GPS geolocation with interactive map fallback, and offline persistence using IndexedDB/Dexie.js (with background auto-sync upon network reconnection).

---

## STRICT SCOPE RULE

Modify ONLY:
- `frontend/SamvadApp/src/pages/ReportIssuePage.tsx`
- `frontend/SamvadApp/src/hooks/useGeolocation.ts`
- `frontend/SamvadApp/src/services/offlineStorage.ts` (Create if missing)
- `frontend/SamvadApp/src/components/AudioRecorder.tsx` (Create if missing)
- `frontend/SamvadApp/src/services/api.ts`

Do NOT touch:
- `backend/`
- `shared/`
- `root package.json`

---

## Task Breakdown

### 1. Offline Persistence Engine (`src/services/offlineStorage.ts`)
Create a persistent browser storage service using IndexedDB (or fallback to `localStorage` queue):
- **Schema:** Store pending ticket payloads: `{ id, title, description, category, priority, location, photos, audioBlob, createdAt }`.
- **Sync Trigger:** Listen for the browser's `online` window event (`window.addEventListener('online', ...)`).
- **Auto-Sync Execution:** When connectivity is restored, iterate through queued offline tickets, submit them sequentially via `apiService.createReport()`, and clear the queue upon successful API confirmation.

---

### 2. Audio Voice Note Recorder (`src/components/AudioRecorder.tsx`)
Build an accessible audio recording UI component for low-literacy or quick-reporting users:
- Use standard browser `navigator.mediaDevices.getUserMedia({ audio: true })` and the `MediaRecorder` API.
- **Controls:** Record, Pause/Resume, Stop, Playback preview, and Clear/Re-record.
- **Visual Feedback:** Recording timer (MM:SS) and active status indicators.
- Output the resulting audio as a `Blob` / base64 string to be attached to the issue report payload.

---

### 3. Precision GPS Geolocation (`src/hooks/useGeolocation.ts`)
Enhance `useGeolocation.ts` to capture hardware coordinates with error recovery:
- Execute `navigator.geolocation.getCurrentPosition` with high accuracy enabled (`enableHighAccuracy: true`).
- Extract exact `latitude`, `longitude`, and position `accuracy` (in meters).
- Provide address reverse-geocoding (or mock fallback) to convert coordinates into readable street names.
- Provide a clear UI button: *"Re-capture Current Location"* with active loading state.

---

### 4. Multimodal Report Form Integration (`src/pages/ReportIssuePage.tsx`)
Bring all intake channels together into the primary report page:
- **Category Selection:** Populate strictly with the 5 mandated civic categories:
  1. `Sanitary & Public Hygiene`
  2. `Service Delivery Deficiencies`
  3. `Administrative Delays and Maladministration`
  4. `Abuse of Power or Corruption`
  5. `Systemic and Policy Issues`
- **Location Tagging:** Display live GPS coordinates and reverse-geocoded address.
- **Voice Note Input:** Mount `<AudioRecorder />` allowing users to record an explanation alongside or instead of typed text.
- **Image Attachments:** Drag-and-drop or file picker with live image preview grid.
- **Offline Guard:** Detect network status (`navigator.onLine`). If offline when submitting:
  - Save the report to `offlineStorage`.
  - Show a prominent, friendly notification: *"Report saved offline. It will automatically upload when your internet connection is restored."*

---

## Final Testing & Verification

1. **GPS Test:**
   - Open `/report`. Allow location permissions in browser.
   - Confirm lat/lng coordinates and address populate automatically.

2. **Voice Note Test:**
   - Record a 5-second audio note, stop, play it back, and verify the audio data is attached to the form payload.

3. **Offline Sync Test:**
   - In browser DevTools, switch network mode to **Offline**.
   - Fill out and submit a report on `/report`.
   - Confirm the report is stored locally without network errors.
   - Switch DevTools network mode back to **Online**.
   - Verify the queued report is pushed to the server/localStorage and displayed in the citizen dashboard.