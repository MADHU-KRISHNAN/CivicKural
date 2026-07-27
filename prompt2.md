# Codex Instruction: Add Laptop Responsive Layout & Browser Geolocation

## Objective

Enhance `frontend/SamvadApp` to:
1. Ensure the UI layout is optimized and responsive for laptop/desktop screen resolutions.
2. Implement native browser Geolocation APIs to replace mobile location services.

---

## STRICT SCOPE RULE

Modify ONLY:
- `frontend/SamvadApp`

Do NOT modify:
- `backend/`
- `shared/`
- `root package.json`
- `documentation/`

---

## Task 1: Laptop & Desktop Web Layout Optimization

### UI & Layout Adjustments
- **Container Max-Widths:** Ensure screens don't stretch indefinitely on wide displays. Center main content containers using standard max-widths (e.g., `max-width: 1200px` or `1440px`) with centered margins (`margin: 0 auto`).
- **Responsive Grids:** Convert single-column mobile list views (e.g., issues, dashboards, cards) into multi-column grid layouts for screen sizes above `768px` and `1024px`.
- **Navigation:** Adjust mobile drawer or bottom-tab navigation to render as a top navbar or side navigation drawer suited for desktop viewports.
- **Form UI:** Set reasonable widths for forms, inputs, and buttons so they do not stretch across the entire screen on large monitors.
- **Media Queries:** Use standard CSS breakpoints:
  - Mobile: `< 768px`
  - Tablet: `768px - 1024px`
  - Laptop/Desktop: `> 1024px`

---

## Task 2: Web Geolocation Implementation

### Replace Native Location Packages
- Remove any mobile-specific location imports (e.g., `react-native-geolocation-service`, `expo-location`).

### Browser API Integration
- Implement the native HTML5 Geolocation API (`navigator.geolocation`).
- Create a dedicated location service utility or custom React hook (e.g., `useGeolocation.ts`).

### Expected Behavior
- Request browser permission when location-based features are accessed (e.g., reporting an issue, finding nearby items).
- Handle success state: Retrieve `latitude`, `longitude`, and `accuracy`.
- Handle error states gracefully:
  - User denied permission
  - Location unavailable
  - Request timeout
- Provide fallback UI or manual input options if location access is denied or fails.

Example Hook Implementation Logic:
```typescript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Pass coordinates to existing application flow
    },
    (error) => {
      console.error("Error retrieving location:", error);
    }
  );
} else {
  console.warn("Geolocation is not supported by this browser.");
}