# 🛡️ FactCheck AI - PDF Fact-Checking Agent

A modern, full-stack AI application that extracts factual claims from PDF documents and verifies them using **Gemini AI Grounding** (Google Search) with a robust offline fallback.

## 🚀 Features

- **PDF Text Extraction:** Seamlessly parses text from uploaded PDF documents.
- **AI Claim Identification:** Automatically identifies specific, verifiable factual claims (dates, stats, technical specs).
- **Dual Verification Engine:**
  - **Live Grounding:** Verifies claims against real-time web data using Google Search.
  - **Stable Fallback:** Automatically switches to internal AI knowledge if web-search quotas are exceeded, ensuring the app never "hangs."
- **Modern UI/UX:** A professional dashboard with progress tracking, status badges, and responsive design.
- **Throttled Processing:** Sequential processing with intentional delays to maintain stability on free-tier API quotas.

## 🛠️ Tech Stack

- **Frontend:** React 19, Axios, Parcel (Bundler).
- **Backend:** Node.js, Express 5.
- **AI:** Google Gemini SDK (`gemini-3.1-flash-lite`).
- **Processing:** `pdf-parse` (mehmet-kozan version) for robust PDF handling.

## 📋 Prerequisites

- Node.js (v20+)
- A Google AI Studio API Key ([Get one here](https://aistudio.google.com/))

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd assignment
```

### 2. Configure Backend
Navigate to the `backend` folder and create a `.env` file:
```bash
cd backend
npm install
```
Add your API key to `.env`:
```env
GEMINI_API_KEY=your_key_here
PORT=5001
```

### 3. Setup Frontend
Navigate to the `frontend` folder:
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

### Start the Backend
```bash
cd backend
node server.js
```

### Start the Frontend
```bash
cd frontend
npm start
```
The application will be available at **http://localhost:1234**.

## 🛡️ Reliability Features

- **Sequential Processing:** To stay within Free Tier rate limits, the agent processes one claim every 2 seconds.
- **Graceful Error Handling:** If a specific claim fails to verify, the rest of the report will still be generated.
- **Source Transparency:** Each verification clearly states if it was sourced from "Web Search" or "AI Knowledge."

---

