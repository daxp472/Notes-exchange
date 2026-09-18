<div align="center">

# 🎓 College Notes Exchange
### *AI-Powered University Study Materials, Lecture Notes & Collaborative Hub*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Website-notes--exchange.netlify.app-00C7B7?style=for-the-badge)](https://notes-exchange.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/daxp472/Notes-exchange?style=for-the-badge&color=ffd700)](https://github.com/daxp472/Notes-exchange)

<p align="center">
  <a href="#-key-features"><b>Explore Features</b></a> •
  <a href="#-quick-start"><b>Quick Start</b></a> •
  <a href="#-tech-stack"><b>Tech Stack</b></a> •
  <a href="#-database-setup"><b>Database Schema</b></a> •
  <a href="#-ai-engine--taxonomy"><b>AI Rules</b></a> •
  <a href="#-founder--leadership"><b>Founder</b></a>
</p>

---

</div>

## 📌 Overview

**College Notes Exchange** is an open-source, full-stack academic ecosystem built to empower university students across disciplines (**BCA, B.Tech CSE, MBBS, MBA, Law, and Applied Sciences**). 

Students can discover peer-reviewed lecture notes, previous year exam question papers (PYQs), collaborate inside real-time study channels, track exam countdown timetables, and earn **NoteCoins** for their academic contributions.

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>📑 Verified Notes & PYQs Catalog</h3>
      <p>Instant search and filter by semester, course code, and branch with built-in PDF reader, formula sheets, and peer review ratings.</p>
    </td>
    <td width="50%">
      <h3>🪙 NoteCoins & Contribution Economy</h3>
      <p>Students earn NoteCoins by uploading quality study materials, unlocking community recognition, badges, and top-tier notes.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>👥 Real-Time Study Groups</h3>
      <p>Topic and course-specific collaborative rooms with shared resource feeds, group messaging, and active participant tracking.</p>
    </td>
    <td width="50%">
      <h3>⏳ Exam Countdown & Schedule Planner</h3>
      <p>Automated milestone scheduling, syllabus completion bars, and live countdown timers for midterm and final exams.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌓 Obsidian Midnight Glassmorphism</h3>
      <p>Tailored dark mode theme designed with high-contrast accessibility tokens for late-night exam revision sessions.</p>
    </td>
    <td width="50%">
      <h3>⚡ Cloud Uptime & Keep-Alive Engine</h3>
      <p>Automated background heartbeat service that keeps server instances active 24/7 with sub-second health monitoring.</p>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

```
Frontend  : React 18 • TypeScript • Vite • Tailwind CSS • Lucide Icons
Backend   : Node.js (ES Modules) • Express.js • Multer • Helmet • Rate-Limiting
Database  : Supabase (PostgreSQL) • Row-Level Security (RLS) • Prepared Statements
SEO & AI  : JSON-LD Schema (Schema.org) • XML Sitemap • Semantic AI Taxonomy
Deploy    : Netlify (Frontend SPA) • Render (Cloud Web Service API)
```

---

## 🏗️ Repository Architecture

```bash
Notes-exchange/
├── 📂 ai_rules/             # AI discovery rules, semester taxonomy & progression algorithms
├── 📂 backend/              # Node.js Express REST API server
│   ├── config/              # Supabase client & production keep-alive service
│   ├── controllers/         # Business logic for notes, chat, auth, and analytics
│   ├── middleware/          # JWT authentication & error handlers
│   ├── routes/              # Modular Express endpoint definitions
│   └── server.js            # Server entrypoint with /health routes
├── 📂 frontend/             # Modern React 18 + TypeScript + Vite SPA
│   ├── public/              # _redirects, robots.txt, sitemap.xml, assets
│   ├── src/                 # Components, hooks, contexts, and pages
│   └── netlify.toml         # Netlify build configuration
├── 📂 database_scripts/     # Clean Supabase PostgreSQL migrations & seed data
│   ├── 01_full_schema.sql
│   ├── 02_seed_sample_data.sql
│   ├── 03_points_and_rewards_schema.sql
│   ├── 04_add_avatar_url_and_bio.sql
│   └── 05_complete_features_tables.sql
├── 📂 docs/                 # Developer guides, deployment steps, and checklists
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PROJECT_ANALYSIS.md
│   └── SETUP_INSTRUCTIONS.md
├── netlify.toml             # Root SPA redirection & headers configuration
├── LICENSE                  # MIT License
├── CONTRIBUTING.md          # Open-source contribution workflow
└── SECURITY.md              # Vulnerability reporting policy
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/daxp472/Notes-exchange.git
cd Notes-exchange
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
> Server runs on `http://localhost:5001` (Health check: `http://localhost:5001/health`)

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```
> App launches at `http://localhost:3000`

---

## 🗄️ Database Setup

Execute the SQL scripts in order inside your **Supabase SQL Editor**:

1. [`01_full_schema.sql`](database_scripts/01_full_schema.sql) — Core users, notes, comments, ratings, and messaging.
2. [`02_seed_sample_data.sql`](database_scripts/02_seed_sample_data.sql) — Initial academic disciplines and notes catalog.
3. [`03_points_and_rewards_schema.sql`](database_scripts/03_points_and_rewards_schema.sql) — NoteCoins point ledger & balances.
4. [`04_add_avatar_url_and_bio.sql`](database_scripts/04_add_avatar_url_and_bio.sql) — Profile photo uploads & avatar assignment.
5. [`05_complete_features_tables.sql`](database_scripts/05_complete_features_tables.sql) — Study groups, exam timetables & activity logs.

---

## 🧠 AI Engine & Taxonomy

The [`ai_rules/`](ai_rules/) directory defines the platform's intelligent ranking, semantic discoverability, and semester progression taxonomy:

- **[Discipline Taxonomy Rules](ai_rules/DISCIPLINE_TAXONOMY_RULES.md)**: Academic branch categorization for Computer Applications, Engineering, Medical, and Law.
- **[Semester Progression Algorithm](ai_rules/SEMESTER_PROGRESSION_ALGORITHM.md)**: Curates recommended study materials based on student academic standing.
- **[SEO & AI Discovery Rules](ai_rules/SEO_AND_AI_DISCOVERY_RULES.md)**: Optimizations for indexing across Google, Bing, GPTBot, Perplexity, and Claude.

---

## 👨‍💻 Founder & Project Lead

<div align="left">

**Dax Patel** — *Founder & Lead Architect*
- GitHub: [@daxp472](https://github.com/daxp472)
- Live Platform: [notes-exchange.netlify.app](https://notes-exchange.netlify.app/)
- Contact: [daxpatel.cg@gmail.com](mailto:daxpatel.cg@gmail.com)

</div>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to contribute, share, and build upon it!

<div align="center">
  <sub>Built with ❤️ by students, for students worldwide.</sub>
</div>
