# 🌽 Kisan AI — Har Khet Ka Digital Agronomist

<div align="center">

![Kisan AI](https://img.shields.io/badge/Kisan-AI-yellow?style=for-the-badge&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-orangered?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash_Lite-indigo?style=for-the-badge&logo=google)

**Every Farmer Deserves an AI Agronomist — in their own language, with real-time local data.**

[What We Built](#-what-we-built) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Team](#-team)

</div>

---

## 🎯 The Problem We're Solving

India has **140 million farmers**. Most of them:
- Cannot afford agronomic consultants
- Face language barriers with existing agri-tech apps
- Make crop and selling decisions without real market data
- Have no way to diagnose crop diseases without visiting a specialist

**Kisan AI changes this.** We put an intelligent farming advisor directly in the farmer's hands — speaking their language, using their local weather, and showing their nearest mandi prices.

---

## 🚀 What We Built

Kisan AI is a full-stack progressive web app that combines:

- 🤖 **Conversational AI** that understands Hindi, Punjabi, Marathi, Telugu, Tamil, and English
- 👁️ **Computer Vision** that diagnoses crop diseases from a photo in seconds
- 🌦️ **Hyperlocal Weather Intelligence** with soil moisture and irrigation alerts
- 📊 **Live Mandi Price Tracking** with MSP comparison
- 🎤 **Voice-first Interface** — talk to the AI, listen to its replies

---

## ✨ Features

### 🧭 Khet Overview Dashboard
The dashboard is now organized around farmer-first widgets with bilingual labels: Mitti Ka Hal, Aaj Ka Bhav, Mausam Alert, and Fasal Score, plus Aaj Ki Salah and Khet Diary summaries.

### 🤖 Multilingual AI Chat
Farmers can chat in their native language. Every single AI response is grounded with live data — current temperature, soil moisture from the field, today's mandi rates, and the farmer's own crop profile. Nothing generic. Everything local.

### 🔬 Crop Disease Detector
Point your camera at a sick plant. Upload the photo. Within seconds, Gemini Vision identifies:
- Disease name + scientific classification
- Severity level (Low → Critical)
- Step-by-step treatment plan
- Specific pesticide recommendations with dosage

### 🌱 Smart Crop Advisor
Tell us your soil type, season, water availability, and land size. Our AI recommendation engine returns the top crops to grow with full ROI breakdown — investment, expected revenue, profit per acre, and risk rating.

### 🌦️ Weather Intelligence Dashboard
Not just temperature. We pull:
- Real soil moisture from Open-Meteo sensors
- Evapotranspiration (ET₀) using FAO Penman-Monteith formula
- Solar radiation data
- 7-day forecast + 24-hour hourly trends
- AI-generated spray window and irrigation alerts based on actual conditions

### 📈 Mandi Price Intelligence
Live commodity prices for Wheat, Rice, Maize, Soybean, Cotton, Mustard, Groundnut, and Tur. Every price is shown alongside the government MSP so farmers know instantly whether the market is above or below support price.

### 📋 Farm Activity Ledger
Log every field operation — sowing, irrigation, fertilizer, pesticide, weeding, harvest. Track costs, status, and get AI insights on your activity patterns.

### 🏛️ Government Schemes Directory
PM-KISAN, Fasal Bima Yojana, Kisan Credit Card, Soil Health Card — with deadlines, eligibility, and direct application links. Available in Hindi and English.

### 🎤 Voice Interface
- **Speak to the AI** — mic button with real-time Hindi/regional language transcription
- **AI speaks back** — every response has a Listen button with native language TTS
- Built entirely on Web Speech API — zero extra cost, works in Chrome

### 🧮 Khet Score
- Overall farm health score (0-100)
- Breakdown by Soil, Weather, Activity, and Market
- Actionable AI recommendations for improvement

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 |
| AI Model | Google Gemini (Chat + Vision) |
| Voice | Web Speech API (STT + TTS) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Weather | Open-Meteo API |
| Geocoding | Nominatim / OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |

---

## 🌍 Languages Supported

| Language | Code | Script |
|---|---|---|
| English | `en` | Latin |
| Hindi | `hi` | Devanagari |
| Punjabi | `pa` | Gurmukhi |
| Marathi | `mr` | Devanagari |
| Telugu | `te` | Telugu |
| Tamil | `ta` | Tamil |

---

## 🏗️ System Architecture
```
┌──────────────────────────────────────────────┐
│              Farmer's Browser                │
│  Next.js · Tailwind · Recharts · Web Speech  │
│  GPS → Nominatim → Location Name            │
│  Firebase Auth JWT → Protected Routes        │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│           Next.js API Routes                 │
│  /api/ai      → Gemini AI (chat + vision)   │
│  /api/forecast→ Open-Meteo (weather+soil)   │
│  /api/mandi   → Mandi prices + MSP          │
│  /api/advisory→ Unified AI advisory route   │
└──────────┬───────────────────┬───────────────┘
           │                   │
┌──────────▼──────┐  ┌─────────▼──────────────┐
│  Google Gemini  │  │      Firebase           │
│  · AI Chat      │  │  · Auth (Google+Email)  │
│  · Vision       │  │  · Firestore DB         │
│  · Crop Advisor │  │  · User Profiles        │
└─────────────────┘  └────────────────────────┘
```

## 📁 Folder Structure

```text
kisanai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── onboarding/
│   ├── (dashboard)/
│   │   ├── home/
│   │   ├── advisor/
│   │   ├── diagnose/
│   │   ├── crops/
│   │   ├── markets/
│   │   ├── forecast/
│   │   ├── yojana/
│   │   ├── khet-diary/
│   │   ├── khet-score/
│   │   ├── profile/
│   │   └── settings/
│   └── api/
│       ├── ai/
│       ├── advisory/
│       ├── forecast/
│       └── mandi/
├── components/
│   ├── advisor/
│   ├── diagnose/
│   ├── layout/
│   ├── ui/
│   └── shared/
├── core/
├── hooks/
├── services/
├── config/
├── constants/
├── utils/
├── styles/
├── models/
└── assets/
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (free Spark plan)
- Google Gemini API key (free at aistudio.google.com)

### 1. Clone & Install
```bash
git clone https://github.com/deepraj-07/Kisan-AI.git
cd Kisan-AI
npm install
```

### 2. Environment Setup
Create `.env.local` in the project root:
```env
# Gemini AI
GEMINI_API_KEY=your_key_here

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=""

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Firebase Setup
- Enable **Email/Password** and **Google** in Authentication
- Create **Firestore Database** in `asia-south1` region (test mode)

### 4. Run
```bash
npm run dev
```
Open `http://localhost:3000`

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|


---

## 🔐 Security Notes
- All pages protected via AuthGuard
- Firebase JWT validated on every server request
- Admin SDK credentials never exposed to browser
- `.env.local` excluded from version control

---

## 🐛 Common Issues

**Gemini 404 error** → Model name may be deprecated. Use `gemini-2.0-flash-lite`

**Location shows wrong city** → Allow browser location permission → refresh

**Login fails** → Check Firebase Console → Authentication → Sign-in providers enabled

**Market prices look static** → Expected! Fallback hardcoded prices are used (no API key needed for demo)

---

<div align="center">
Built with ❤️ for Indian farmers · Protex: Hack-2-Win
</div>
