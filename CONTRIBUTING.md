# Contributing to College Notes Exchange 📚

First off, thank you for considering contributing to College Notes Exchange! It's people like you that make university study and knowledge sharing open, accessible, and fast for students everywhere.

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Notes-exchange.git
   cd Notes-exchange
   ```
3. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```
4. **Setup Environment Variables**:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`

---

## 🛠️ Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Make your modifications following our code style:
   - Frontend: TypeScript, React, Tailwind CSS, Lucide icons
   - Backend: Node.js, Express, ES Modules, Supabase Client
3. Test both frontend and backend locally:
   ```bash
   # Frontend
   npm run build

   # Backend
   npm run dev
   ```
4. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(study-groups): add participant limit selector"
   ```
5. Push to your branch and open a **Pull Request**.

---

## 📋 Pull Request Guidelines

- Ensure your code builds without TypeScript or Lint errors (`npm run build`).
- Keep PRs focused on a single feature or fix.
- Provide a summary of changes and before/after screenshots for UI updates.
- Adhere to the [MIT License](LICENSE) terms.

---

## 💡 Questions & Community

- **Founder & Maintainer**: Dax Patel
- **Issues & Discussions**: [GitHub Issues](https://github.com/daxp472/Notes-exchange/issues)
