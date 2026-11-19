# Codeforces DSA Profile & Gap Analyzer

A full-stack developer analytics platform that transforms raw, contest-oriented Codeforces submission history into standardized Data Structures & Algorithms (DSA) metrics, detects topic gaps, and generates targeted interview preparation roadmaps.

---

## 📌 Problem Statement

Codeforces is the premier platform for competitive programming, but its problem tags are designed for contest strategy rather than software engineering interview preparation:
- Tags are fragmented (e.g., `dfs and similar`, `shortest paths`, `flows` are scattered rather than grouped under **Graphs**).
- Submissions include duplicate solves, test penalties, and failed attempts (`WA`, `TLE`), distorting genuine mastery.
- Candidates lack an explainable measure of technical interview readiness across high-yield topics like Dynamic Programming, Trees, and Binary Search.

**This application solves this by:**
1. Fetching all user submissions from the official Codeforces API and deduplicating unique accepted solutions ($O(N)$ linear pass).
2. Normalizing 35+ competitive programming tags into **13 standardized SWE interview categories**.
3. Enforcing a **2.1-second outbound request queue** to strictly comply with Codeforces rate limits.
4. Implementing a **Cache-Aside pattern** with Firebase Firestore (6-hour TTL with active eviction and hourly cleanup).
5. Computing an explainable, multi-factor **Interview Readiness Index (0–100)** with actionable 1-click Codeforces practice links.
6. Generating an automated technical diagnostic review powered by Google Gemini (single aggregated API call).

---

## 🏗️ Architecture & Tech Stack

```text
┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
│  React 18 + Vite Client │  HTTP   │  Node.js + Express API │  REST   │     Codeforces API     │
│    (Tailwind CSS)      ├────────►│     (ES Modules)       ├────────►│      (user.status)     │
└────────────────────────┘         └───────────┬────────────┘         └────────────────────────┘
                                               │
                                 Cache-Aside   │   Single-Call
                                  (6-hr TTL)   │    Summary
                                               ▼               ▼
                                    ┌────────────────────┐   ┌────────────────────┐
                                    │ Firebase Firestore │   │   Google Gemini    │
                                    │    (cf_profiles)   │   │  (Flash Models)    │
                                    └────────────────────┘   └────────────────────┘
```

### Frontend
- **React 18** with **Vite** (sub-second HMR, native ES modules build)
- **Tailwind CSS** (dark console-style theme, responsive grid)
- **Lucide React** (lightweight icon system)
- **Vite Dev Proxy** (forwards `/api` requests to backend during local development)

### Backend
- **Node.js & Express** (modular REST service in native ES Modules)
- **In-Memory Request Queue** (enforces $\ge 2.1\text{s}$ delay between outbound API calls to eliminate HTTP 429 bans)
- **Firebase Firestore Admin SDK** (Cache-Aside store with proactive TTL eviction)
- **Google Gen AI SDK (`@google/genai`)** (automated performance review on aggregated metrics)

---

## ⚙️ Key Engineering Implementations

### 1. In-Memory Request Queue Throttler
Codeforces strictly allows only 1 request per 2 seconds per IP. Standard debounce mechanisms fail if multiple users query the server simultaneously.
- Outbound calls are enqueued into an in-memory asynchronous worker (`requestQueue.js`).
- The worker guarantees that every call waits at least **2,100ms** after the start of the previous request before firing, buffering IP bursts without third-party brokers.

### 2. Cache-Aside Pattern with Dual-Layer Eviction
- **Cache Hit (< 6 hours):** Serves cached profile data from Firestore in $< 100\text{ms}$ with zero Codeforces or AI API calls.
- **On-Access Eviction:** If a requested profile is older than 6 hours, the backend deletes the stale document from Firestore before fetching fresh data.
- **Background Janitor:** An hourly background sweeper (`purgeExpiredCache`) queries and batch-deletes orphaned records older than 6 hours to prevent database bloat.
- **Force Refresh:** Users can trigger `?refresh=true` from the UI to bypass the cache when they have recently solved new problems.

### 3. Interview Readiness Index Algorithm (0–100)
Rather than relying on arbitrary numbers, the readiness score is calculated deterministically:

$$\text{Readiness Index} = \text{round}(0.40 \times \text{Breadth} + 0.40 \times \text{Depth} + 0.20 \times \text{Volume})$$

- **Breadth (40%):** Percentage of the 13 core DSA topics with $\ge 5$ unique solves.
- **Depth (40%):** Overall average problem rating normalized against a $1600$ difficulty benchmark (solid SWE medium/hard).
- **Volume (20%):** Total unique problem solves normalized against a target of $120$ problems.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$
- (Optional) Free Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- (Optional) Firebase Service Account Key for live Firestore (defaults to in-memory store if not provided)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/CF_Tracker.git
cd CF_Tracker
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment file from template
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```
*(Note: If `GEMINI_API_KEY` or Firebase credentials are not provided, the server automatically uses rule-based heuristic evaluations and an in-memory cache store, allowing complete local development without external credentials).*

Start the backend:
```bash
npm run dev
```
Backend runs on `http://localhost:5001`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

Run backend integration tests (health check, live profile fetch, 404 handling):
```bash
cd server
npm test
```

Build the frontend client:
```bash
cd client
npm run build
```

---

## 🌐 Production Deployment Guide

### Deploying the Backend (Render / Railway)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect your repository and configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. In **Environment Variables**, add:
   - `PORT=5001`
   - `GEMINI_API_KEY=your_key`
   - `FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}` *(paste the contents of `serviceAccountKey.json` as a single-line string)*.
5. Deploy. Render will provide a public URL (e.g., `https://cf-tracker-api.onrender.com`).

### Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL=https://cf-tracker-api.onrender.com` *(your backend Render URL)*
5. Click **Deploy**.

---

## 📂 Project Structure

```text
CF_Tracker/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js          # Firestore initialization with in-memory fallback
│   │   ├── constants/
│   │   │   └── dsaTopics.js         # Tag dictionary & interview pattern metadata
│   │   ├── controllers/
│   │   │   └── profileController.js # Request validation & HTTP error mapping
│   │   ├── routes/
│   │   │   ├── healthRoutes.js      # /health server liveness probe
│   │   │   └── profileRoutes.js     # /api/profile/:handle endpoint
│   │   ├── services/
│   │   │   ├── aiService.js         # Gemini diagnostic assessment
│   │   │   ├── cacheService.js      # Cache-aside & automated TTL janitor
│   │   │   ├── codeforcesService.js # Throttled API client
│   │   │   ├── dsaNormalizer.js     # Deduplication, tag mapping & readiness engine
│   │   │   └── profileService.js    # Pipeline orchestrator
│   │   ├── utils/
│   │   │   └── requestQueue.js      # In-memory 2.1s request queue
│   │   ├── app.js                   # Express application & middleware setup
│   │   ├── server.js                # Port listener & background tasks
│   │   └── testApi.js               # HTTP integration tests
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBanner.jsx      # Error handling alerts
│   │   │   ├── GapAnalysisCard.jsx  # Readiness Index & targeted practice links
│   │   │   ├── LoadingState.jsx     # Pipeline loading indicator
│   │   │   ├── Navbar.jsx           # Header & API connection status
│   │   │   ├── OverviewCards.jsx    # Solved metrics & cache age tags
│   │   │   ├── SearchBar.jsx        # Handle input & quick preset chips
│   │   │   ├── TopicBreakdown.jsx   # Filterable topic table & distribution bars
│   │   │   └── AiDiagnosticCard.jsx # Performance review & action items
│   │   ├── services/
│   │   │   └── api.js               # Centralized fetch wrapper
│   │   ├── App.jsx                  # Main dashboard view
│   │   ├── index.css                # Tailwind directives
│   │   └── main.jsx                 # React root
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 📜 License
This project is licensed under the ISC License.
