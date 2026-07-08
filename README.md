<div align="center">

# 🎯 AI Interview Platform

### Practice interviews with an AI that actually reads your resume.

An end-to-end, AI-powered mock-interview platform. Upload your resume, pick a role, and get personalized interview questions, per-answer AI scoring, ATS resume analysis, and rich performance analytics.

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ai--reviewer--resume.vercel.app-000000?style=for-the-badge)](https://ai-reviewer-resume.vercel.app/)

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

</div>

---

## 🌐 Live Demo

> **👉 [https://ai-reviewer-resume.vercel.app/](https://ai-reviewer-resume.vercel.app/)**

Sign up, upload a resume (PDF), pick a target role, and start a mock interview. The frontend is on Vercel; the backend runs as a Docker container.

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 📄 | **Resume upload & parsing** | Drop a PDF — text is extracted server-side with Apache PDFBox (raw file never stored). |
| 🎯 | **ATS match score** | AI scores your resume against a target role (0–100) with strengths and concrete improvement tips. |
| 🗣️ | **Live mock interviews** | Google Gemini generates questions **one at a time**, grounded in your actual resume so they feel personalized and non-repetitive. |
| ⌨️🎤 | **Type or speak answers** | Answer by typing or via browser speech-to-text, with a live webcam "proctoring" panel. |
| 🧠 | **Per-answer AI scoring** | Every answer gets a score plus strengths, weaknesses, and suggestions. |
| 📊 | **Analytics dashboard** | Radar charts, score timelines, and distributions across all completed interviews (Recharts). |
| 🔐 | **Secure auth** | BCrypt-hashed passwords and stateless JWT sessions, scoped so you only ever see your own data. |

---

## 🧩 Tech Stack

### Frontend — `/frontend`

| Concern | Choice |
|---|---|
| UI framework | **React 19** + React DOM |
| Language | **TypeScript** |
| Build tool / dev server | **Vite** (`@vitejs/plugin-react`) |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) |
| Routing | **React Router** (code-split with `React.lazy`) |
| Client state | **Zustand** (auth store, persisted to localStorage) |
| Server state / caching | **TanStack React Query** |
| HTTP client | **Axios** (with JWT auth interceptor) |
| Forms | **React Hook Form** |
| Animations | **Framer Motion** |
| Icons | **lucide-react** |
| Notifications | **react-hot-toast** |
| Charts | **Recharts** |
| Webcam | **react-webcam** |
| Code editor | **@monaco-editor/react** |
| Linting | **oxlint** (Rust-based) |

### Backend — `/backend`

| Concern | Choice |
|---|---|
| Framework | **Spring Boot 4.1** |
| Language | **Java 21** |
| Web layer | Spring Web MVC |
| Security | Spring Security + **JWT** (`io.jsonwebtoken` / jjwt) |
| Data access | Spring Data MongoDB |
| PDF text extraction | **Apache PDFBox** |
| Validation | Spring Boot Validation (Jakarta) |
| Boilerplate | **Lombok** |

### Database & AI

- **MongoDB** — collections: `users`, `interviews`, `resumes`, `job_roles`.
- **Google Gemini** (`gemini-2.5-flash`) — called over HTTP with **structured JSON output** (`responseSchema`) so responses deserialize straight into DTOs.

---

## 🏗️ Architecture

```
                         Axios + JWT
   ┌─────────────────┐   (Bearer token)   ┌──────────────────────┐        ┌──────────┐
   │  React + Vite   │ ─────────────────▶ │   Spring Boot 4 API  │ ─────▶ │ MongoDB  │
   │  (SPA, Vercel)  │ ◀───────────────── │  Controller→Service  │ ◀───── │  Atlas   │
   └─────────────────┘   JSON responses   │     →Repository      │        └──────────┘
                                          └──────────┬───────────┘
                                                     │ HTTP (RestTemplate)
                                                     ▼
                                          ┌──────────────────────┐
                                          │  Google Gemini API   │
                                          │  (structured JSON)   │
                                          └──────────────────────┘
```

A classic three-tier SPA. The backend is layered — **Controllers** (REST) → **Services** (business logic) → **Repositories** (Spring Data MongoDB). All AI features go through a single `AIService`, so the provider could be swapped in one place.

---

## 🔄 How It Works

1. **Sign up / log in** → password is BCrypt-hashed; login returns a signed JWT (24h). An Axios interceptor attaches it to every request and auto-logs-out on `401`.
2. **Upload resume** → `POST /api/resumes/upload` (multipart). PDFBox extracts the text; only the text + metadata are stored, scoped to your email.
3. **Check ATS score** → `POST /api/ai/ats-score` → Gemini returns an `AtsReport` (score, summary, strengths, improvements).
4. **Start interview** → creates an `Interview` (`UPCOMING`), then `POST /{id}/start` (`RUNNING`).
5. **Answer questions** → questions generated one at a time via `POST /{id}/questions/next`; answers submitted to `POST /{id}/answer` and scored by Gemini in the background.
6. **Finish** → `POST /{id}/complete` (`COMPLETED`).
7. **Review analytics** → completed interviews are aggregated into radar charts, timelines, and score distributions.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Java 21** (JDK)
- A **MongoDB** connection string (Atlas or local)
- A **Google Gemini** API key

### 1. Clone

```bash
git clone https://github.com/UtsavMNNIT/AI-resume-reviewer.git
cd "AI resume reviewer"
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts Vite dev server
```

Available scripts:

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with oxlint |

### 3. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Configure via environment variables (secrets stay in git-ignored `*-secrets.properties` locally):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins (supports `*.vercel.app`) |

---

## 📁 Project Structure

```
AI-Interview-Platform/
│
├── frontend/            # React 19 + TypeScript + Vite (SPA)
├── backend/             # Spring Boot 4 REST API
│   ├── src/             # Controllers, Services, Repositories, DTOs
│   ├── Dockerfile       # Multi-stage build (Maven+JDK21 → slim JRE)
│   └── pom.xml
├── docs/                # Architecture & design notes
├── project overview.md  # Deep-dive walkthrough + interview-prep Q&A
└── README.md
```

---

## ☁️ Deployment

- **Frontend → Vercel** — static build in `dist/`, global CDN, per-PR preview URLs.
- **Backend → Docker container** — multi-stage build (`maven:3.9-eclipse-temurin-21` → `eclipse-temurin:21-jre`), binds to the platform `$PORT`. Built for Render / Google Cloud Run.
- **CORS** is configured to allow the Vercel domains, including wildcard preview URLs.

---

## 🎨 Design Notes

Curious *why* each tool was chosen (Zustand vs Redux, MongoDB vs Postgres, Gemini vs OpenAI, one-at-a-time question generation, etc.)? See **[`project overview.md`](./project%20overview.md)** for a full design Q&A and a set of interview-style questions & answers about the architecture.

---

<div align="center">

**[🚀 Try the live demo →](https://ai-reviewer-resume.vercel.app/)**

Built with React, Spring Boot & Google Gemini.

</div>
