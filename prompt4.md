# Codex Instruction: Enterprise UI Refactor & Production-Grade Layout Implementation for CivicKural

## Objective

Refactor the entire frontend UI across `frontend/CivicKuralApp/` to transform it from an AI-prototype style into a high-density, production-ready, enterprise-grade municipal software interface (inspired by Stripe Dashboard, Tailwind UI Enterprise, and USWDS).

The new interface must look like a paid B2B municipal SaaS product—emphasizing data density, high contrast, clean typography, and operational efficiency without generic AI tropes (no sparkles, no glowing gradients, no floating card fluff).

---

## STRICT SCOPE RULE

Modify / Refactor ONLY:
- `frontend/CivicKuralApp/src/components/`
- `frontend/CivicKuralApp/src/pages/`
- `frontend/CivicKuralApp/src/index.css` (or Tailwind theme configuration)

Do NOT modify:
- REST API integration routes, state management stores, or backend payload contracts.

---

## Design System & Styling Rules

### 1. Color Palette & Typography
- **Background Surface:** `#F8FAFC` (`slate-50`) or solid `#FFFFFF`.
- **Primary Text:** High-contrast `#0F172A` (`slate-900`).
- **Secondary Text:** Crisp `#64748B` (`slate-500`).
- **Borders & Dividers:** Precise `#E2E8F0` (`slate-200`).
- **Brand Accent:** Authoritative Deep Navy `#1E3A8A` (`blue-900`).
- **Status Badges (Semantic Only):**
  - High / Verified: `#15803D` text on `#DCFCE7` bg (`emerald`).
  - Standard / Pending: `#B45309` text on `#FEF3C7` bg (`amber`).
  - Low / Spam / Flagged: `#B91C1C` text on `#FEE2E2` bg (`red`).
- **Font Stack:** Clean, neutral sans-serif (`Inter`, `Public Sans`, or system `-apple-system`).

### 2. Mandatory Component Refactoring

#### A. Banner & Status Badges
- **REMOVE:** All sparkles (`✨`), robot icons (`🤖`), purple/pink gradients (`bg-gradient-to-r`), and text labels like "Auto-detected by AI".
- **REPLACE WITH:** Clean, functional system badges:
  ```tsx
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
    System Categorized
  </span>