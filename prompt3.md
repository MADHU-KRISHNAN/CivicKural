# Codex Instruction: DistilBERT Model Fine-Tuning & Multi-Label Intent Refinement Pipeline for CivicKural

## Objective

Fix the recurring text misclassification issue in **CivicKural** where environmental and public health emergencies (such as open garbage burning causing smoke/road obstruction) are incorrectly mapped to `Systemic and Policy Issues` instead of `Sanitary & Public Hygiene`.

Implement a robust **Fine-Tuning Data Pipeline** and **Hybrid Intent Guardrail System** inside `backend/src/services/AiCategorizationService.js` (and Java Spring Boot equivalent) to ensure high-accuracy categorization across all edge cases without relying on simple string matching.

---

## STRICT SCOPE RULE

Modify / Create ONLY:
- `backend/src/services/AiCategorizationService.js` (or `AiCategorizationService.java`)
- `backend/scripts/fine_tune_distilbert.py` (or Python ML training notebook)
- `shared/types.ts`

Do NOT modify:
- Core frontend UI layout files, existing database schemas, or authentication strategies.

---

## Task Breakdown

### 1. Hybrid Classification Architecture (Model + Softmax Thresholding + Intent Guardrails)

Update `AiCategorizationService` to use a 2-stage inference pipeline: