# FinDora Web — SVKM DJSCE Campus Lost & Found Platform

> **Next.js 16 App Router Full-Stack Web Application (FST Track)**  
> Developed for **Dwarkadas J. Sanghvi College of Engineering**

---

## 💻 Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router with React Server Components & Streaming)
- **Database (Relational):** SQLite managed via **Prisma ORM** (`prisma/schema.prisma`)
- **Database (Document Store):** MongoDB audit trail logging via **Mongoose** (`src/models/AuditLog.ts`)
- **Authentication & RBAC:** Session cookies with JWT + bcrypt password hashing; Route Guard via Next.js Proxy layer (`src/proxy.ts`)
- **Iconography:** Custom monochrome SVG vector line icons (`src/components/LineIcons.tsx`)
- **Styling:** Vanilla CSS design tokens & CSS Modules (`src/app/globals.css`) with responsive desktop widescreen layout

---

## 🌟 Key Features

1. **4-Section Discovery Catalog (`/browse`):**
   - Active Lost Items, Active Found Items, My Claims (with live status), and Claimed Items (with verified owner name & handover status).
2. **Desktop Widescreen Layout (`/profile`):**
   - Optimized for desktop screens (`max-width: 1360px`), 4-column KPI analytics ribbon, 2-column asymmetric workspace (65%/35%), and card hover micro-interactions.
3. **Strict SVKM Verification Claims (`/items/[id]`):**
   - Compulsory `@svkmmumbai.onmicrosoft.com` email suffix.
   - Roll number regex: `^[A-Za-z][0-9]{3}$`.
   - SAP ID regex: `^6[0-9]{10,11}$`.
   - Substantive proof requirement (min 5 chars).
   - Real-time user claim display with Ground Floor Security Desk (Gate 2) handover instructions.
4. **Admin Security & Moderation Console (`/admin`):**
   - Review pending verification claims, examine confidential proof of ownership, approve/reject claims with competing claim auto-locking, award finder points (+50 pts), and manage the physical Handover Queue.
   - Role-based guard automatically redirects non-admins and routes admins navigating to `/profile` directly to `/admin`.
5. **REST API Backend for Flutter Mobile App:**
   - Exposes `/api/items`, `/api/claims`, `/api/chat`, `/api/auth/*`, and `/api/ai/match`.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup SQLite Database with Prisma
```bash
npx prisma generate
npx prisma db push
node prisma/seed.mjs
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build Production Bundle
```bash
npm run build --webpack
```
