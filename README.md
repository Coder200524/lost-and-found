# FinDora — SVKM DJSCE Campus Lost & Found Platform
> **Dual-Platform Architecture: Next.js 16 App Router Full-Stack Web App + Flutter/Dart Mobile App**  
> Developed for **Dwarkadas J. Sanghvi College of Engineering (Autonomous College Affiliated to the University of Mumbai)**  
> **Course Tracks:** Full Stack Track (FST) & Application Development Framework (ADF)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Chronological Log of Commands & Actions Executed](#chronological-log-of-commands--actions-executed)
3. [Syllabus Concept Mapping (DJSCE ADF & FST)](#syllabus-concept-mapping-djsce-adf--fst)
   - [Part I: Full Stack Track (FST) — Next.js 16 App Router](#part-i-full-stack-track-fst--nextjs-16-app-router)
   - [Part II: Application Development Framework (ADF) — Flutter & Gemini](#part-ii-application-development-framework-adf--flutter--gemini)
4. [Project Architecture & Directory Structure](#project-architecture--directory-structure)
5. [Database Schema & Seed Data (Prisma ORM & Mongoose)](#database-schema--seed-data-prisma-orm--mongoose)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Pre-configured Test Accounts (RBAC)](#pre-configured-test-accounts-rbac)
8. [How to Run the Project Locally](#how-to-run-the-project-locally)

---

## 🌸 Project Overview
**FinDora** is a campus lost-and-found management ecosystem for Dwarkadas J. Sanghvi College of Engineering (DJSCE). It allows students and faculty to:
- Report lost and found items with detailed metadata, campus locations (e.g., *Room 402, Library 3rd Floor, Canteen*), rewards, and photos.
- Browse, search, and filter items with real-time category chips and status badges.
- Match belongings using **Gemini AI Assistance** and an interactive swipe matcher.
- Submit ownership verification claims with proof of ownership.
- Manage items and approve/reject claims via an **Admin Security Moderation Console**.
- Seamlessly access data across both **Web (Next.js App Router)** and **Mobile (Flutter & Dart)** powered by a shared REST API backend.

---

## ⏱️ Chronological Log of Commands & Actions Executed

Below is the complete, step-by-step chronological record of all commands run and modifications made:

| Step | Scope | Command / Action | Description |
|---|---|---|---|
| **1** | Git / Workspace | Direct archive extraction from `FinDora.git` | Downloaded source files without cloning git history or forking as requested: `admin.html`, `browse.html`, `chat.html`, `index.html`, `login.html`, `post.html`, `profile.html`, `swipe.html`. |
| **2** | Git | `git init -b main` | Initialized a fresh Git repository on branch `main`. |
| **3** | Git | `git add .` & `git commit -m "initial commit"` | Created clean initial root commit containing all legacy source files. |
| **4** | Remote | `git remote add origin https://github.com/Coder200524/lost-and-found.git` | Linked repository to remote `lost-and-found.git`. |
| **5** | Git Push | `git push -u origin main` | Pushed clean initial commit directly to remote `origin/main`. |
| **6** | Web (FST) | `cd web; npm install` | Restored and resolved Next.js TypeScript base dependencies in `web/`. |
| **7** | Web (FST) | `npm install prisma @prisma/client mongoose bcryptjs jsonwebtoken lucide-react` | Installed Prisma ORM, Mongoose document store, authentication security libraries (bcrypt + JWT), and icons. |
| **8** | Web (FST) | `npm install -D @types/bcryptjs @types/jsonwebtoken` | Installed TypeScript typings for security packages. |
| **9** | Mobile (ADF) | `flutter create mobile_app --org com.djsce.findora --project-name mobile_app` | Generated the Flutter mobile application framework project. |
| **10** | Mobile (ADF) | `cd mobile_app; flutter pub add http` | Added Dart HTTP package for web API integration with the Next.js backend. |
| **11** | Database (FST) | `prisma/schema.prisma` created & `prisma@^6.4.1` pinned | Defined SQLite relational schema with `User`, `Item`, and `Claim` models. |
| **12** | Database (FST) | `npx prisma generate` | Generated type-safe `@prisma/client` bindings. |
| **13** | Database (FST) | `npx prisma db push` | Synced Prisma schema with local SQLite database (`dev.db`). |
| **14** | Database (FST) | `node prisma/seed.mjs` | Executed database seeder creating 4 users (Admin, Students, Guest) and 8 campus lost & found records. |
| **15** | Database (FST) | `src/lib/mongoose.ts` & `src/models/AuditLog.ts` | Created Mongoose schema and resilient connection for document store audit logging. |
| **16** | Auth (FST) | `src/lib/auth.ts` & `src/proxy.ts` | Implemented session management, password hashing, and role-based route guard using Next.js Proxy layer. |
| **17** | API (FST) | `src/app/api/...` route handlers | Built REST endpoints: `/api/items`, `/api/items/[id]`, `/api/claims`, `/api/stats`, `/api/auth/*`, and `/api/ai/match`. |
| **18** | UI (FST) | `src/app/(public)`, `(auth)`, `(dashboard)` | Implemented App Router route groups, React Server Components, layout inheritance, template files, and CSS Modules. |
| **19** | Actions (FST) | `src/actions/items.ts`, `claims.ts`, `auth.ts` | Built Server Actions (`"use server"`) with cache revalidation (`revalidatePath`). |
| **20** | Verification | `npm run build --webpack` | Built and validated Next.js production bundle (17/17 routes compiled, 0 errors). |
| **21** | Mobile (ADF) | `mobile_app/lib/...` | Created Dart models, `ApiService`, `GeminiService`, custom widgets, and 5 multi-page screens. |
| **22** | Verification | `flutter analyze` | Executed Flutter Dart static analyzer (`No issues found!`). |
| **23** | Clean-up | `Remove-Item *.html` | Cleaned up root directory HTML files while preserving original source files in `legacy-html/`. |
| **24** | Mindmap Schema | `prisma/schema.prisma` update | Added `sapId`, `points`, `badge` to `User`; `isHotspot`, `isMasked`, `isUrgent`, `reportsCount` to `Item`; added `ChatMessage` model for in-app chat. |
| **25** | Database Sync | `npx prisma db push` & `node seed.mjs` | Applied schema changes to SQLite and re-seeded with SVKM SAP IDs, Points, Badges, and Hotspot areas. |
| **26** | Auth / SAP ID | `src/app/api/auth/login` & `(auth)/login` | Implemented SVKM SAP ID + Password login restricting outsiders, with quick 1-click evaluation logins for Admin (`ADMIN-001`), Students (`60004210045`, `60004210088`), and Guest (`GUEST-999`). |
| **27** | Privacy & Security | `src/app/(public)/items/[id]` | Enforced Mindmap privacy rules: hidden personal phone/email from public cards, masked sensitive ID card details, and added predefined handover safety protocol. |
| **28** | Found Item Rule | `src/actions/items.ts` & Mobile form | Enforced "MANDATORY PHOTO" validation rule on all Found items before submission. |
| **29** | Points System | `src/actions/claims.ts` & Profile | Implemented Reward/Points system: Finder awarded +50 points and upgraded badge on claim approval. |
| **30** | Chat & Moderation | `/api/chat` & `/api/items/[id]/report` | Created In-App Chat endpoint with safety reminders and Report Misuse / Fake Claim moderation endpoint. |

---

## 🎯 Syllabus Concept Mapping (DJSCE ADF & FST)

### Part I: Full Stack Track (FST) — Next.js 16 App Router

| Unit | Syllabus Topic | Implemented Location & Features in `web/` |
|---|---|---|
| **Unit 1** | **Introduction to Next.js & App Router Architecture**<br>• TypeScript scaffold (`create-next-app`)<br>• `app/` directory paradigm<br>• File-system routing: page routes, layout inheritance, template files, nested route grouping `(group)`, dynamic segments `[slug]`/`[id]`<br>• React Server Components (RSC) vs Client Components (`'use client'`) | • Scaffolded in `web/` with strict TypeScript configurations.<br>• Route Groups: `src/app/(public)`, `src/app/(auth)`, `src/app/(dashboard)`.<br>• Layout Inheritance: Global root layout (`src/app/layout.tsx`), group layout (`(public)/layout.tsx`).<br>• Template Lifecycle: `src/app/(public)/template.tsx` with transition animations.<br>• Dynamic Segments: `src/app/(public)/items/[id]/page.tsx` and API route `src/app/api/items/[id]/route.ts`.<br>• RSC vs Client: Server components for data fetching (`HomePage`, `BrowsePage`) vs Client components (`SwipeMatcherPage`, `ClaimForm`, `LoginPage`). |
| **Unit 2** | **Modern UI Engineering & Layout Orchestration**<br>• Tailwind CSS integration<br>• Component-level isolated styling using CSS Modules (`.module.css`)<br>• Persistent state, global root layouts (`layout.tsx`), shared structural UI frames | • Tailwind utility-first styling with pastel theme (`src/app/globals.css`).<br>• CSS Modules: `src/components/Navbar.module.css` for isolated styling tokens.<br>• Root layout frames: Shared navbar and footer across partial rendering boundaries. |
| **Unit 3** | **React Server Components, Server Actions & Streaming**<br>• Native async data fetching inside Server Components<br>• Caching architectures & revalidation (`revalidatePath`)<br>• Asynchronous UI rendering using `loading.tsx` & React `<Suspense>`<br>• Data mutations via Server Actions (`"use server"`)<br>• Standard REST endpoints using App Router Route Handlers (`route.ts`) | • Async RSC data fetching: `src/app/(public)/page.tsx` and `browse/page.tsx`.<br>• Streaming boundaries: `src/app/(public)/browse/loading.tsx` skeleton loader.<br>• Server Actions: `src/actions/items.ts` (`createItemAction`), `src/actions/claims.ts` (`submitClaimAction`, `resolveClaimAction`), `src/actions/auth.ts`.<br>• Cache Revalidation: `revalidatePath('/browse')`, `revalidatePath('/admin')`.<br>• REST Route Handlers: `src/app/api/items/route.ts`, `src/app/api/items/[id]/route.ts`, `src/app/api/claims/route.ts`, `src/app/api/stats/route.ts`. |
| **Unit 4** | **Database Integration (Prisma ORM & Mongoose)**<br>• Type-safe schemas with Prisma ORM<br>• Migrations, database client generation, CRUD mutations inside Server Actions<br>• Document stores: Connecting to MongoDB via Mongoose schema frameworks, document mutations | • Prisma ORM: `prisma/schema.prisma` with `User`, `Item`, `Claim` models.<br>• Database Client: `src/lib/prisma.ts` singleton.<br>• Database Migrations & Seed: `prisma db push`, `prisma/seed.mjs`.<br>• Mongoose Integration: `src/lib/mongoose.ts` and `src/models/AuditLog.ts` creating document store audit trails on every item/claim mutation. |
| **Unit 5** | **Modern Authentication, Session Control & Security**<br>• Session verification using Next.js Proxy layer (`proxy.ts`)<br>• Multi-provider / Email-Password handling with bcrypt<br>• Role-based authorization rules (`ADMIN`, `USER`, `GUEST`) | • Authentication helper: `src/lib/auth.ts` (bcrypt hashing, JWT tokens, HTTP-only session cookies).<br>• Proxy Layer: `src/proxy.ts` enforcing RBAC guards (`/admin` restricted strictly to `ADMIN` role).<br>• Role switcher and login portal: `src/app/(auth)/login/page.tsx`. |
| **Unit 6** | **Optimization, Edge Layers & Cloud Deployment**<br>• Static & dynamic SEO tracking via Next.js `Metadata` API<br>• Asset optimizations (`next/image`)<br>• `.env` runtime configurations | • Static SEO Metadata: `src/app/layout.tsx`.<br>• Dynamic SEO Metadata: `generateMetadata()` in `src/app/(public)/items/[id]/page.tsx`.<br>• Environment configuration: `web/.env`. |

---

### Part II: Application Development Framework (ADF) — Flutter & Gemini

| Module | Syllabus Topic | Implemented Location & Features in `mobile_app/` |
|---|---|---|
| **Module 1** | **Gemini for Application Developers**<br>• Develop an app with Gemini assistance<br>• Mini Project I: Application built on concepts learned | • `mobile_app/lib/services/gemini_service.dart`: Automatic category detection from natural language text.<br>• `mobile_app/lib/screens/gemini_matcher_screen.dart`: Mini Project I — Smart semantic matcher comparing reported items with active campus findings with AI reasoning and percentage match confidence.<br>• Next.js AI Match Endpoint: `web/src/app/api/ai/match/route.ts`. |
| **Module 2 & 3** | **Introduction to Flutter and Dart Language**<br>• Flutter toolchain, SDK, basics of Dart<br>• Internals of Dart, types, functions, classes, libraries | • Pure Dart typed classes: `mobile_app/lib/models/item.dart` with JSON serialization (`fromJson` / `toJson`).<br>• Asynchronous Dart programming using `async` / `await` and `Future`. |
| **Module 4** | **Working with Flutter**<br>• Development process, Widgets, Forms, Navigation, Styling | • Material 3 UI theming: `mobile_app/lib/main.dart` with custom color schemes.<br>• Custom Widgets: `ItemCard`, `StatusChip`, `TypeBadge` in `mobile_app/lib/widgets/`.<br>• Form validation & interaction: `mobile_app/lib/screens/post_item_screen.dart` using `GlobalKey<FormState>`. |
| **Module 5** | **Building a Flutter Application (Mini Project II)**<br>• Multi-page app that fetches web API data<br>• Common Flutter widgets for layouts, images, media | • `mobile_app/lib/services/api_service.dart`: Fetches live web API data from the Next.js backend.<br>• 5-tab multi-page navigation shell: Home, Browse, Gemini AI Matcher, Report, Profile.<br>• Network images with loading fallback placeholders and pull-to-refresh (`RefreshIndicator`). |

---

### Part III: SVKM Swipe & Find Architectural Mindmap Implementation Matrix

| Mindmap Branch | Requirement from Chart | Implementation in Next.js (`web/`) & Flutter (`mobile_app/`) |
|---|---|---|
| **Users** | • SVKM Students (Login: SAP ID)<br>• Faculty / Staff<br>• Admin Panel (Verification, Moderation) | • Seeded student accounts with SAP IDs (`60004210045`, `60004210088`), Admin (`ADMIN-001`), and Guest (`GUEST-999`).<br>• Admin Panel at `/admin` for verification and moderation. |
| **Authentication System** | • SAP ID + Password Login<br>• College Database Integration<br>• Restrict Outsiders (SVKM Only) | • Multi-lookup auth supporting 11-digit SVKM SAP ID or college email.<br>• Non-SVKM login attempts restricted via `src/app/api/auth/login/route.ts` and `src/proxy.ts`. |
| **Main Features** | • Post Lost Item (Details, location, reward)<br>• Post Found Item (**MANDATORY IMAGE!**, Claim request enabled)<br>• Swipe Feature (Hinge-Style: Right = "My Item!", Left = "Not Relevant")<br>• Search & Filter | • Found items strictly require image upload before submission.<br>• Swipe Matcher at `/swipe` with Tinder/Hinge-style cards, match saving, and shortlist.<br>• Filter bar with type pills, categories, and keyword search. |
| **Privacy & Security** | • **Hide Personal Info** (No phone/email public)<br>• Mask Sensitive Details (ID Numbers Blurred)<br>• Report Misuse / Fake Claims | • Public item cards and detail pages do **NOT** expose raw phone numbers or emails; all verification is conducted through the platform.<br>• Automatic masking on ID Card items (`isMasked: true`).<br>• Report Misuse endpoint at `/api/items/[id]/report` and UI report button. |
| **Categories** | ID Cards, Bottles, Stationery, Electronics, Bags, Accessories, Others | Aligned across Prisma schema, dropdown forms, browse category pills, and Flutter filter bar. |
| **Communication System** | • In-App Chat After Match<br>• Predefined Safety Messages<br>• Proof of Ownership Step Before Handover | • In-App Chat endpoint at `/api/chat` for verified item communications.<br>• Predefined Handover Safety protocol banner displayed on all item pages.<br>• Proof of ownership form required before claim submission. |
| **Location System** | • Tag Exact/Approximate Location<br>• "Hotspot Zones" (High Loss Areas) | • Hotspot detection for high-loss campus zones: Canteen, Central Library 3rd Floor, Room 402, IT Lab 3, Gymkhana.<br>• High-visibility Hotspot Zone badges on affected items. |
| **Admin Features** | • Approve/Reject Posts<br>• Remove Fake/Spam Posts<br>• Handle Reports<br>• Manage SAP Database | • Security Moderation Console at `/admin` with one-click claim approval and rejection Server Actions.<br>• User SAP ID directory and reported items queue. |
| **Matching Logic** | • Category, Location Proximity, Date Similarity<br>• Suggest "Possible Matches" | • Gemini AI Semantic Matcher at `/api/ai/match` scoring title, description, and location proximity. |
| **Innovative Features** | • AI Matching Suggestions ("This might be your item")<br>• Reward / Points System (Earn points for returning items)<br>• Lost Alerts (Notify nearby users) | • Automatic +50 Points & "Campus Hero" badge awarded to finders upon claim approval.<br>• Points balance displayed on user profile.<br>• Lost Alerts urgent banner for time-sensitive belongings. |

---

## 🏗️ Project Architecture & Directory Structure

```
ADF n FST/
├── README.md                      # Comprehensive project documentation
├── legacy-html/                   # Original static HTML templates for reference
│   ├── index.html, browse.html, post.html, swipe.html, chat.html, profile.html, admin.html, login.html
│
├── web/                           # Next.js 16 Full-Stack Web Application (FST)
│   ├── .env                       # Environment variables
│   ├── package.json               # Dependencies & scripts
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma ORM schema (User, Item, Claim)
│   │   ├── dev.db                 # SQLite database file
│   │   └── seed.mjs               # Database seeder script
│   └── src/
│       ├── proxy.ts               # Next.js Proxy Layer (RBAC Route Guard)
│       ├── lib/
│       │   ├── prisma.ts          # Prisma client singleton
│       │   ├── mongoose.ts        # Mongoose MongoDB connection
│       │   └── auth.ts            # Authentication & session control
│       ├── models/
│       │   └── AuditLog.ts        # Mongoose document schema
│       ├── actions/               # Next.js Server Actions ("use server")
│       │   ├── items.ts           # Item mutations & revalidation
│       │   ├── claims.ts          # Claim submissions & resolutions
│       │   └── auth.ts            # Form login & logout
│       ├── components/
│       │   ├── Navbar.tsx         # Navbar server component
│       │   ├── Navbar.module.css  # Isolated CSS Module
│       │   ├── Footer.tsx         # Footer component
│       │   └── ClaimForm.tsx      # Claim form client component ('use client')
│       └── app/
│           ├── globals.css        # FinDora pastel tokens & Tailwind utilities
│           ├── layout.tsx         # Root layout with Static SEO metadata
│           ├── api/               # REST API Route Handlers
│           │   ├── items/route.ts & [id]/route.ts
│           │   ├── claims/route.ts
│           │   ├── stats/route.ts
│           │   ├── auth/login, register, me, logout
│           │   └── ai/match/route.ts   # Gemini AI Matcher endpoint
│           ├── (public)/          # Public route group
│           │   ├── layout.tsx & template.tsx
│           │   ├── page.tsx       # Landing page with live counts
│           │   ├── browse/        # Browse catalog & loading skeleton
│           │   ├── items/[id]/    # Dynamic item page with Dynamic SEO metadata
│           │   └── swipe/         # Interactive card swiper
│           ├── (auth)/login/      # Auth portal with RBAC switcher
│           └── (dashboard)/       # Protected route group
│               ├── post/          # Report item form
│               ├── profile/       # User profile & my claims
│               └── admin/         # Security admin moderation console
│
└── mobile_app/                    # Flutter & Dart Mobile Application (ADF)
    ├── pubspec.yaml               # Flutter package configuration
    └── lib/
        ├── main.dart              # Material 3 entrypoint & BottomNavigation
        ├── models/
        │   └── item.dart          # Type-safe Dart model with fromJson/toJson
        ├── services/
        │   ├── api_service.dart   # HTTP client communicating with Next.js REST API
        │   └── gemini_service.dart# Gemini AI classification & campus advisor
        ├── widgets/
        │   ├── item_card.dart     # Custom card widget with network image & tags
        │   └── status_chip.dart   # Status and Type pill widgets
        └── screens/
            ├── home_screen.dart   # Dashboard with stats & recent reports
            ├── browse_screen.dart # Catalog with search, filters & pull-to-refresh
            ├── item_detail_screen.dart # Details view with claim submission dialog
            ├── post_item_screen.dart   # Report item form with Gemini auto-detect
            ├── gemini_matcher_screen.dart # Mini Project I: Gemini semantic matcher
            └── profile_screen.dart     # Student digital ID card & evaluation credentials
```

---

## 🗄️ Database Schema & Seed Data (Prisma ORM & Mongoose)

### 1. Prisma Relational Schema (`web/prisma/schema.prisma`)
```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         String    @default("USER") // ADMIN, USER, GUEST
  avatar       String?   @default("👤")
  phone        String?
  department   String?   @default("Information Technology")
  collegeId    String?   @default("DJSCE-2024")
  createdAt    DateTime  @default(now())
  items        Item[]
  claims       Claim[]
}

model Item {
  id           String    @id @default(cuid())
  title        String
  description  String
  category     String    // Electronics, ID & Cards, Books & Stationery, Accessories, Keys, Clothing
  type         String    // LOST or FOUND
  location     String    // e.g. Room 402, Library 3rd Floor, Canteen
  dateOccurred String    // YYYY-MM-DD
  status       String    @default("OPEN") // OPEN, CLAIMED, RESOLVED, CLOSED
  imageUrl     String?   @default("")
  reward       String?   @default("")
  contactName  String
  contactEmail String
  contactPhone String?
  userId       String?
  user         User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  claims       Claim[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Claim {
  id            String    @id @default(cuid())
  itemId        String
  item          Item      @relation(fields: [itemId], references: [id], onDelete: Cascade)
  claimantId    String?
  claimant      User?     @relation(fields: [claimantId], references: [id], onDelete: SetNull)
  claimantName  String
  claimantEmail String
  proofDetails  String
  status        String    @default("PENDING") // PENDING, APPROVED, REJECTED
  createdAt     DateTime  @default(now())
}
```

### 2. Mongoose Document Schema (`web/src/models/AuditLog.ts`)
```typescript
interface IAuditLog {
  action: string;
  entityType: 'ITEM' | 'CLAIM' | 'USER' | 'AUTH';
  entityId?: string;
  performedBy: string;
  role: string;
  details: Record<string, unknown>;
  timestamp: Date;
}
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Query items with `?q=`, `?category=`, `?type=`, `?status=` filters |
| `POST` | `/api/items` | Report a new lost or found item (consumed by Flutter & Web) |
| `GET` | `/api/items/:id` | Fetch single item details with claimant information |
| `PATCH` | `/api/items/:id` | Update item status (`OPEN`, `CLAIMED`, `RESOLVED`) |
| `DELETE` | `/api/items/:id` | Remove an item report |
| `GET` | `/api/claims` | List verification claims |
| `POST` | `/api/claims` | Submit an ownership verification claim |
| `GET` | `/api/stats` | Platform statistics (total items, resolved count, categories) |
| `POST` | `/api/auth/login` | Email/password sign-in issuing JWT HTTP-only session cookie |
| `POST` | `/api/auth/register`| Register student account |
| `GET` | `/api/auth/me` | Fetch active user session |
| `POST` | `/api/auth/logout`| Invalidate session cookie |
| `POST` | `/api/ai/match` | Gemini AI semantic matching algorithm for lost & found items |

---

## 👥 Pre-configured Test Accounts (RBAC)

Use these credentials on `/login` or via the one-click quick fillers to evaluate role-based authorization:

| Role | Email | Password | Access Rights & Purpose |
|---|---|---|---|
| **ADMIN** | `admin@djsce.edu` | `admin123` | Full access to `/admin` security console, claim approvals, and statistics. |
| **USER (Student)** | `rahul@djsce.edu` | `student123` | Standard student account for reporting items, filing claims, and `/profile`. |
| **USER (Student 2)** | `priya@djsce.edu` | `student123` | Second student profile for testing cross-user claims. |
| **GUEST** | `guest@djsce.edu` | `guest123` | Restricted campus visitor account. |

---

## 🚀 How to Run the Project Locally

### Prerequisites
- **Node.js**: v18+ (v22 installed)
- **npm**: v10+
- **Flutter SDK**: v3.24+ (v3.47 installed)

---

### Step 1: Run the Full-Stack Web Application (Next.js)

1. Open a terminal and navigate to the `web` folder:
   ```bash
   cd "web"
   ```

2. (Optional) Re-seed the database with sample items:
   ```bash
   node prisma/seed.mjs
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   - **Homepage:** `http://localhost:3000`
   - **Browse Catalog:** `http://localhost:3000/browse`
   - **Gemini Swipe Matcher:** `http://localhost:3000/swipe`
   - **Login / Role Portal:** `http://localhost:3000/login`
   - **Admin Security Console:** `http://localhost:3000/admin` (Sign in as `admin@djsce.edu`)

---

### Step 2: Run the Flutter Mobile Application

1. Open a second terminal and navigate to `mobile_app`:
   ```bash
   cd "mobile_app"
   ```

2. Fetch Flutter packages:
   ```bash
   flutter pub get
   ```

3. Run the app on your preferred target (Windows desktop, Chrome, or connected mobile device/emulator):
   ```bash
   # Run on Windows Desktop:
   flutter run -d windows

   # Or run in Chrome browser:
   flutter run -d chrome
   ```

4. The mobile app will automatically communicate with the Next.js backend running on `http://localhost:3000/api`!
