# CivicKural — AI-Powered Civic Governance & Grievance Platform

Developed by **Madhu Krishnan**  
Repository: [https://github.com/MADHU-KRISHNAN/CivicKural](https://github.com/MADHU-KRISHNAN/CivicKural)

---

## 🏛️ Overview
**CivicKural** is an automated, AI-driven public grievance and municipal management platform connecting citizens directly with civic authorities. It replaces slow manual routing with:
- **3-Tier NLP Classification** (DistilBERT hierarchy)
- **Geospatial Vector Duplicate Detection** (Cosine Distance $\ge 0.85$ matching within 200m)
- **EXIF Image Trust Scoring** ($0.0 - 1.0$)
- **Dynamic Mathematical Priority Scoring**:
  $$\text{Priority Score} = 0.5(\text{NLP Severity}) + 0.3(\text{Upvote Factor}) + 0.2(\text{Historical Area Risk})$$

---

## 🌟 Architecture & Key Features

### For Citizens 👥
- **Multimodal Intake:** Text descriptions, audio voice notes (MediaRecorder API), and camera photos.
- **Precision Geolocation:** High-accuracy browser GPS coordinates with OpenStreetMap reverse-geocoding.
- **Offline Persistence & Auto-Sync:** Submissions made offline are stored in IndexedDB (`CivicKuralOfflineDB`) and automatically uploaded upon reconnection.

### For Municipal Authorities 🏛️
- **Executive Control Center:** Dark-mode glassmorphic control center with metric cards and 30-day bottleneck surge forecasts.
- **GIS Municipal Risk Heatmap:** Interactive map with color-coded risk clusters, pin tooltips, and department routing.
- **Triage & Dispatch Console:** Automated priority score ordering ($0-100$), supervisory department overrides, and mandated resolution proof media uploads.

---

## 🔧 Technical Stack

- **Frontend:** React 19, TypeScript, Vite, React Router DOM, IndexedDB / Dexie.js
- **Backend:** Node.js, Express, Mongoose, JWT Authentication, Winston Logger
- **AI Pipeline:** NLP 3-Tier Hierarchy, 768-Dim Vector Embeddings, Cosine Distance Similarity, EXIF Forensic Heuristics

---

## 🚀 Quick Start Guide

### 1. Install & Start Backend API Server
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000/api
```

### 2. Install & Start Frontend Web Application
```bash
cd frontend/CivicKuralApp
npm install
npm run dev
# Application running at http://localhost:5173
```

---

## 👤 Author & Ownership
- **Developer:** Madhu Krishnan
- **GitHub Repository:** [https://github.com/MADHU-KRISHNAN/CivicKural](https://github.com/MADHU-KRISHNAN/CivicKural)
- **License:** MIT License