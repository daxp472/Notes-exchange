# 📚 College Notes Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://notes-exchange.netlify.app/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20%7C%20Dark%20Mode-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20ESM-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://notes-exchange.netlify.app/)

A modern, student-centric academic platform designed for university students to share lecture notes, download past exam question papers (PYQs), collaborate in study groups, and track syllabus deadlines.

🌐 **Live Website**: [https://notes-exchange.netlify.app/](https://notes-exchange.netlify.app/)

---

## 🌟 Key Features

- 📑 **Lecture Notes & PYQs Hub**: Search, filter by semester and academic discipline (BCA, B.Tech, MBBS, MBA, Law, Sciences), and preview verified study materials.
- 🪙 **NoteCoins Rewards System**: Earn NoteCoins for uploading notes, receiving high ratings, and unlock rewards or access peer notes.
- 👥 **Real-Time Study Groups**: Create, join, and collaborate in discipline-specific study channels with direct resource sharing.
- ⏳ **Exam Countdown & Study Schedule**: Plan study timetables, track syllabus milestones, and monitor exam countdown timers.
- 💬 **Peer Messaging & Chat**: Private direct messages and group conversations with peer students.
- 🌓 **Obsidian Midnight Dark Theme**: High-contrast, glassmorphism design optimized for nighttime study sessions.
- ⚡ **Render Keep-Alive & Cloud Uptime**: Built-in keep-alive pinging service to keep cloud instances active 24/7.
- 🔍 **SEO & AI Search Engine Optimized**: Rich JSON-LD Schema markup, comprehensive `sitemap.xml`, and open crawler discoverability for Google, Bing, GPTBot, and Perplexity.

---

## 🏗️ Repository Structure

```
Notes-exchange/
├── backend/                  # Node.js Express REST API server
│   ├── config/              # Supabase client & Render keep-alive service
│   ├── controllers/         # API business logic controllers
│   ├── middleware/          # JWT auth & error handling middlewares
│   ├── routes/              # Express route definitions
│   └── server.js            # Server entry point
├── frontend/                 # React 18 + TypeScript + Vite SPA
│   ├── public/              # Static assets, robots.txt, sitemap.xml, _redirects
│   ├── src/                 # React components, pages, contexts, and hooks
│   └── netlify.toml         # Frontend deployment configuration
├── database_scripts/         # PostgreSQL schema migrations and seed scripts
│   ├── 01_full_schema.sql
│   ├── 02_seed_sample_data.sql
│   ├── 03_points_and_rewards_schema.sql
│   ├── 04_add_avatar_url_and_bio.sql
│   └── 05_complete_features_tables.sql
├── docs/                     # Project architecture, guides, and documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PROJECT_ANALYSIS.md
│   ├── SETUP_INSTRUCTIONS.md
│   └── ai_rules/
├── netlify.toml              # Root build & redirect configuration
├── LICENSE                   # MIT License
├── CONTRIBUTING.md           # Contribution guidelines
└── SECURITY.md               # Security vulnerability disclosure
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0+
- **Supabase Account**: Free PostgreSQL database & Auth

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and supply your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET
npm install
npm run dev
```
Backend runs on `http://localhost:5001` (Health: `http://localhost:5001/health`).

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5001
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 🗄️ Database Setup

Run the SQL migration scripts in order from the [`database_scripts/`](database_scripts/) directory in your Supabase SQL Editor:
1. `01_full_schema.sql` - Core users, notes, comments, ratings, messages
2. `02_seed_sample_data.sql` - Sample subjects, universities, and notes
3. `03_points_and_rewards_schema.sql` - NoteCoins point ledger & transactions
4. `04_add_avatar_url_and_bio.sql` - User bio, profile photos & random avatars
5. `05_complete_features_tables.sql` - Study groups, exam schedule, chat channels & activity tracking

---

## 📖 Documentation

Detailed documentation and guides are available in the [`docs/`](docs/) directory:
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Project Architecture & Analysis](docs/PROJECT_ANALYSIS.md)
- [Setup Instructions](docs/SETUP_INSTRUCTIONS.md)
- [Features Implementation](docs/FEATURES_IMPLEMENTATION.md)

---

## 👨‍💻 Founder & Leadership

- **Dax Patel** — *Founder & Lead Developer* ([@daxp472](https://github.com/daxp472))

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
