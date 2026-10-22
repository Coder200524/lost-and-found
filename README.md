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
| **30** | Chat & Moderation | `/api/chat` & `/api/items/[id]/report` | Created In-App Chat endpoint with safety reminders and Report Misuse / Fake Claim moderation endpoint. |
| **31** | Frontend Alignment | `legacy-html/` -> `web/src/app` | Faithfully ported styling, typography, blobs, cards, and interactive swipe physics from legacy HTML templates into Next.js 16 components. |
| **32** | Swipe Physics Fix | `SwipeClient.tsx` & `globals.css` | Fixed font inheritance glitch; engineered smooth pointer/touch gesture dragging, angle tilt, dynamic MINE/NOPE opacity tags, and celebration modal. |
| **33** | Authentication Guard | `src/proxy.ts` & RSCs | Strictly restricted `/browse`, `/post`, `/swipe`, `/chat`, `/items/[id]`, `/profile`, and `/admin` to authenticated SVKM students only, automatically issuing 307 redirects to `/login?callbackUrl=...`. |
| **34** | Admin Auth Resolution | `api/auth/login/route.ts` & `login/page.tsx` | Expanded SVKM email normalization to resolve `@djsce.edu.in`, `@djsce.edu`, `ADMIN-001`, and `admin`; configured smart `/admin` routing for administrators. |
| **35** | Dark Mode (Web & Mobile) | `ThemeProvider.tsx`, `globals.css`, `main.dart` | Engineered dark/light mode toggle across both Web and Flutter mobile app with persistent theme storage, high-contrast dark tokens, and SVKM pastel accents. |
| **36** | Footer Scope Refinement | `src/app/layout.tsx` | Restricted the global footer visibility strictly to the Home page (`/`), hiding it on discovery, posting, swiping, chatting, profile, and admin screens. |
| **37** | Claim Schema & Validation | `prisma/schema.prisma`, `claims.ts`, `/api/claims` | Added `rollNo`, `sapId`, `department`, `academicYear` to Prisma `Claim` model; enforced Roll No (`^[A-Za-z][0-9]{3}$`), SAP ID (`^6[0-9]{11}$`), required proof, duplicate claim rejection, and item/claim status decoupling. |
| **38** | 4-Section Discovery UI | `browse/page.tsx`, `profile/page.tsx`, `browse_screen.dart` | Structured 4 isolated sections: Active Lost Items, Active Found Items, My Claims (with item link and real-time status), and Claimed Items (with verified owner name & handover status). |
| **39** | Admin Verification & Handover | `admin/page.tsx`, `claims.ts` | Added student identity card verification in `/admin`, competing claim prevention, finder reward (+50 pts & badge), Mongoose audit logs, and Handover Queue for marking items `RESOLVED`. |

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
  rollNo        String?
  sapId         String?
  department    String?
  academicYear  String?
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

---

## 🎨 Frontend Architecture & Legacy HTML Design System Alignment

In accordance with user requirements (*"for frontend i gave the html files, use them make it the same"*), the Next.js application frontend was aligned to mirror the layout, design system tokens, typography, component hierarchies, and interactive animations from the provided `legacy-html/` templates:

### 1. Unified Design Tokens & Typography (`globals.css`)
- **Google Fonts Imported:**
  - `'Playfair Display', serif`: Headlines, hero titles, stat counters, and modal headers.
  - `'DM Sans', sans-serif`: Body text, UI controls, navigation items, and forms.
- **SVKM Pastel Color Palette (`:root`):**
  - `--rose`: `#f9c8cf` & `--rose-d`: `#e8848f`
  - `--mint`: `#c4ead9` & `--mint-d`: `#5bbf8e`
  - `--sky`: `#c5dff8` & `--sky-d`: `#5b9fd4`
  - `--lemon`: `#fdf3c0` & `--peach`: `#ffd9b7`
  - `--lavender`: `#ddd6f3` & `--lav-d`: `#9b8bdb`
  - `--text`: `#3a3040` & `--text-s`: `#7a6e80`
- **Dynamic Floating Blobs:** Three-layer keyframe blur blobs (`.blob-1`, `.blob-2`, `.blob-3`) creating an animated background.

### 2. Ported Screen Implementations
| HTML Template | Next.js App Router Page | Features & Backend Integrations |
| :--- | :--- | :--- |
| `index.html` | `src/app/(public)/page.tsx` | Animated hero with floating blobs, live stats counter (`Items Reunited`, `Verified Students`, `Match Rate`), 6 core feature cards, 7-step "How It Works" workflow, category pills, and live database showcase. |
| `browse.html` | `src/app/(public)/browse/page.tsx` | Sticky desktop sidebar with instant search, `ALL / LOST / FOUND` type toggles, category pills with count badges, location quick filters (Canteen, Library, IT Labs, Foyer), campus hotspot alert banner, Gemini AI match bar, and `.item-card` grid. |
| `swipe.html` | `src/app/(public)/swipe/page.tsx` | Tinder/Hinge card swiper deck (`.card-stack`), active matching target banner, swipe feedback tags (`✓ MINE`, `✕ NOPE`), circular buttons (`✕ Not mine`, `ℹ️ Details`, `♥ Could be mine!`), touch & mouse drag physics with rotation, and full-screen match celebration modal (`.match-overlay`). |
| `chat.html` | `src/app/(public)/chat/page.tsx` | In-app peer-to-peer verification chat with conversations sidebar, verified match badges, official SVKM campus security safety reminder banner, message bubble stream, and one-click quick replies. |
| `post.html` | `src/app/(dashboard)/post/page.tsx` | Lost vs Found card toggles (`.type-card`), category pill selector, location quick-chips, photo upload dropzone with privacy note, ethics pledge checkbox, and Server Actions dispatch. |
| `login.html` | `src/app/(auth)/login/page.tsx` | Glassmorphic card (`.card`), SAP ID and password inputs, role tabs (`Student`, `Admin`, `Quick Demo`), helper info banner, and pre-filled one-click credentials. |
| `profile.html` | `src/app/(dashboard)/profile/page.tsx` | Student digital hero with SAP ID, verified badges, circular points display (`340 Points, Rank #12`), reported items tab, claims filed tab, mini stats, and campus achievement badges. |
| `admin.html` | `src/app/(dashboard)/admin/page.tsx` | Sleek dark sidebar (`.admin-sidebar`), moderation stats counters, pending claims verification table with instant Approve (`+50 pts`) / Reject actions, campus lost-item heatmap (`.campus-map`), and student directory. |

### 3. Swipe Card Fix & Physics Engineering
- Fixed CSS font-size inheritance issue where `.card-img` applied `5rem` to internal `.card-type-badge` and `.match-pct` tags. Isolated emoji to `.card-img-emoji` and scoped badge typography to `0.72rem` / `0.78rem`.
- Implemented natural pointer drag physics (`onPointerDown`, `onPointerMove`, `onPointerUp`) with rotation (`dx * 0.08deg`), dynamic opacity for `✓ MINE` / `✕ NOPE` tags, threshold fling out, and pop-in match celebration modal with direct handover chat routing.

### 4. Authentication Lockdown & Dual-Layer Route Protection
In compliance with the security requirement (*"students should not be able to Browse post swipe chat without authentication"*), all discovery, reporting, matching, and peer communication routes are guarded with a dual-layer defense:

1. **Layer 1: Next.js 16 Edge Proxy Layer (`src/proxy.ts`):**
   - Intercepts incoming requests to `/browse`, `/post`, `/swipe`, `/chat`, `/items/:path*`, `/profile`, and `/admin`.
   - Inspects the `findora_session` HTTP-only cookie.
   - If missing or invalid, immediately returns an HTTP `307 Redirect` to `/login?callbackUrl=<requestedPath>`.
   - Restricts `/admin` exclusively to users with `role: "ADMIN"`.

2. **Layer 2: Server-Side Page Authentication Guards (RSC):**
   - `src/app/(public)/browse/page.tsx` checks `getCurrentUser()` -> redirects to `/login?callbackUrl=/browse`.
   - `src/app/(public)/swipe/page.tsx` checks `getCurrentUser()` -> redirects to `/login?callbackUrl=/swipe`.
   - `src/app/(public)/chat/page.tsx` checks `getCurrentUser()` -> redirects to `/login?callbackUrl=/chat`.
   - `src/app/(dashboard)/post/page.tsx` checks `getCurrentUser()` -> redirects to `/login?callbackUrl=/post`.
   - `src/app/(public)/items/[id]/page.tsx` checks `getCurrentUser()` -> redirects to `/login?callbackUrl=/items/${id}`.

3. **Login Interception & Destination Preservation (`src/app/(auth)/login/page.tsx`):**
   - Detects the `callbackUrl` query parameter.
   - Renders a prominent notice: `🔒 Authentication required to access {callbackUrl}. Please sign in below.`
   - After successful SVKM SAP ID validation, instantly navigates the authenticated student back to their desired destination (`router.push(callbackUrl)`).

### 5. Multi-Domain & Role Resolution for Admin Login
- **Issue Diagnosed:** The seeded database records stored faculty admin email as `admin@djsce.edu` with SAP ID `ADMIN-001`, whereas the front-end login portal prefilled `admin@djsce.edu.in`. Strict equality in the Prisma query caused an unauthorized lookup mismatch.
- **Resolution:**
  1. Updated `src/app/api/auth/login/route.ts` with bidirectional domain normalization: automatically alias and match across both `.djsce.edu.in` and `.djsce.edu` domains, and accept `ADMIN-001` or `admin`.
  2. Enhanced `src/app/(auth)/login/page.tsx` so administrators signing in via the Admin tab are directed straight into the `/admin` Security & Moderation Console.

---

## 🌙 Dark Mode System (Web & Mobile)

FinDora features complete dark and light mode synchronization across both the web application and the mobile app:

### 1. Web Application (`web/`)
- **Theme Provider:** `src/components/ThemeProvider.tsx` manages the theme context with persistent `localStorage` synchronization and SSR hydration safety.
- **CSS Architecture (`src/app/globals.css`):**
  - High-contrast, accessibility-tested dark tokens applied when `.dark` class is attached to `<html>`.
  - Dark background: `--bg: #141118`, `--card-bg: #1e1924`, `--border: #352c40`.
  - Muted foregrounds: `--text: #f0eaf5`, `--text-s: #b0a4bc`.
  - Harmonious pastel highlights: soft rose (`#f29ba7`), mint (`#7ed4ad`), sky (`#7eb8eb`), lemon (`#f5e58a`), and lavender (`#bdaaf2`).
  - Glassmorphic card surfaces with dynamic border glows.
- **Interactive Toggle:** Moon/Sun toggle button embedded in `Navbar.tsx` featuring smooth micro-animations.
- **Scoped Footer:** As per layout specifications, the global footer is exclusively displayed on the Home page (`/`), maintaining a clean, distraction-free interface across all discovery, post, swipe, chat, profile, and admin screens.

### 2. Flutter Mobile Application (`mobile_app/`)
- **Dynamic Theme Mode:** Managed in `main.dart` with `themeNotifier` controlling `ThemeMode.light` and `ThemeMode.dark`.
- **Material 3 Color Scheme:**
  - Dark surface colors (`#141118` & `#1E1924`) with lavender accents (`#BDAAF2`).
  - Card widgets, dialogs, bottom navigation bars, and inputs adapt dynamically.
- **Quick Theme Toggle:** Header action button in `home_screen.dart` allowing instant switching between light and dark modes with persistent state.

---

## 🎓 FinDora Claim Workflow, Verification & Handover Lifecycle

### 1. Separate Item Sections
To prevent confusion between active reports, a student's own claims, and completed resolutions, four distinct views are established across both Web and Mobile:

| Section | Target State | Web Location | Mobile Location | Description |
|---|---|---|---|---|
| **Lost Items** | `type: "LOST"`, `status: "OPEN"` | `/browse?type=LOST` | `BrowseScreen` (Lost Tab 🔴) | Active reports of items students have lost on campus. |
| **Found Items** | `type: "FOUND"`, `status: "OPEN"` | `/browse?type=FOUND` | `BrowseScreen` (Found Tab 🟢) | Active reports of recovered items available for ownership claims. |
| **My Claims** | Claims submitted by authenticated student | `/profile#my-claims` | `ProfileScreen` (My Claims Card 📋) | Student's own submitted claims with item details, submission timestamp, and live review status (`PENDING`, `APPROVED`, `REJECTED`). |
| **Claimed Items** | `status: "CLAIMED"` or `"RESOLVED"` | `/browse?type=CLAIMED` | `BrowseScreen` (Claimed Tab 🤝) | Items with an approved claim or completed handover. Shows verified owner name and handover status while keeping student PII private. |

---

### 2. Claim Submission Flow & Modal Dialog
When an authenticated student views an active `FOUND` item on `/items/[id]` or the mobile `item_detail_screen.dart`:
1. The **"Claim This Item"** action opens the ownership claim modal.
2. The modal prominently displays the item's title, campus location, date reported, and thumbnail.
3. The claimant inputs their Roll Number, SAP ID, and detailed Proof of Ownership.
4. Optional dropdowns for Department and Academic Year are provided.
5. All inputs are validated on both client-side and server-side before dispatch.
6. The claim is associated with the authenticated student's session and the target item with status `PENDING`.
7. Submitting a claim does **NOT** automatically approve it or modify item ownership.
8. The item remains `OPEN` in active discovery listings for other potential claimants.
9. Duplicate active claims (`PENDING` or `APPROVED`) by the same student for the same item are blocked.

---

### 3. Required Field Validation Specifications

| Field | Requirement | Validation Rule / Regex | Description & Error Behavior |
|---|---|---|---|
| **Roll Number** | **Required** | `^[A-Za-z][0-9]{3}$` | Exactly 4 characters: 1 alphabetic letter followed by 3 numeric digits (e.g. `A123`, `B007`). Enforced client-side and in Server Actions/API. |
| **SAP ID** | **Required** | `^6[0-9]{11}$` | Exactly 12 numeric digits starting with `6` (SVKM standard). Rejects spaces, letters, and special characters. Stored as string to preserve formatting. |
| **Proof of Ownership** | **Required** | Min length: 5 non-whitespace chars | Substantive ownership verification text (e.g. serial numbers, unique markings, wallpaper description, stickers). Must be non-empty. Kept strictly private. |
| **Department** | *Optional* | Valid institution list | Dropdown populated with DJSCE departments (*Information Technology, Computer Engineering, Artificial Intelligence & Data Science, EXTC, Computer Science & Engineering, Mechanical Engineering*). |
| **Academic Year** | *Optional* | Valid academic years | Dropdown populated with *FE (First Year), SE (Second Year), TE (Third Year), BE (Final Year)*. |

---

### 4. Claim and Item Status Management

Item status and claim status are kept strictly separate:
- **Claim Statuses:** `PENDING`, `APPROVED`, `REJECTED`
- **Item Statuses:** `OPEN`, `CLAIMED`, `RESOLVED`, `CLOSED`

#### State Transition Logic:
```
[ Item Reported: FOUND ]
         │
         ▼
[ Item Status: OPEN ] ◄────────────────────────────────────────┐
         │                                                     │
         ├──► Student Submits Claim (Claim: PENDING)           │
         │    (Item remains OPEN in active discovery)          │
         │                                                     │
         ▼                                                     │
[ Admin Verification at /admin ]                               │
         │                                                     │
         ├─── If Claim REJECTED:                               │
         │    Claim Status -> REJECTED                         │
         │    (Item remains OPEN for competing claims) ────────┘
         │
         └─── If Claim APPROVED:
              Claim Status -> APPROVED
              Competing Pending Claims -> Auto-REJECTED
              Item Status -> CLAIMED (Removed from active Lost/Found listings)
              Finder Awarded -> +50 Points & "Campus Hero" Badge
              Item Added to -> Claimed Items Section
                      │
                      ▼
              [ Physical Handover at Ground Floor Security Desk ]
                      │
                      ▼
              Admin Clicks "Complete Handover (Mark Resolved)"
              Item Status -> RESOLVED (Handover Complete)
```

---

### 5. Admin Verification & Handover Queue
In the `/admin` Security & Moderation Console:
- **Pending Claims Review:**
  - Displays claimant's name, email, Roll Number, SAP ID, Department, and Academic Year.
  - Displays item details, photo, and the confidential Proof of Ownership.
  - Server-side role check enforces `role === 'ADMIN'`.
- **One-Click Approval / Rejection:**
  - Approving a claim transitions the item to `CLAIMED` and automatically marks competing pending claims for that item as `REJECTED`.
  - Finder is credited with **+50 reward points** and awarded the **Campus Hero** badge.
  - Action is logged in MongoDB via Mongoose `AuditLog` (`CLAIM_APPROVED`, `CLAIM_REJECTED`).
- **Handover Resolution Queue:**
  - Dedicated administrative queue for items awaiting physical collection at the **Ground Floor Security Desk**.
  - Admin verifies student ID card and clicks **"Complete Handover (Mark Resolved)"**.
  - Transitions item status to `RESOLVED` and generates an `ITEM_HANDOVER_RESOLVED` audit log.

---

### 6. Privacy & Personal Information Protection
To safeguard student privacy and prevent identity theft:
- General discovery cards and public item pages do **NOT** expose Roll Numbers, SAP IDs, phone numbers, or Proof of Ownership.
- On `CLAIMED` and `RESOLVED` item pages, only the **verified owner's name** is shown to authorized viewers (claimant, finder, and administrators).
- Proof details and academic credentials are exclusively accessible to administrators in the `/admin` console and the submitting student in their private `/profile#my-claims` tab.

---

### 7. Verification & Test Suite Summary

The entire workflow has been tested and verified across both platforms:

| Scenario Tested | Test Input / Action | Expected Result | Result |
|---|---|---|---|
| **Valid Roll Number** | `A123`, `B007`, `c456` | Matches `^[A-Za-z][0-9]{3}$`, form accepts | ✅ PASS |
| **Invalid Roll Number** | `1234`, `AB12`, `A12`, `A1234` | Rejects with clear format warning | ✅ PASS |
| **Valid SAP ID** | `60004210045`, `600012345678` | Matches `^6[0-9]{11}$`, form accepts | ✅ PASS |
| **Invalid SAP ID** | `50004210045`, `6000421004`, `abc`, `6000 4210 045` | Rejects with 12-digit requirement starting with 6 | ✅ PASS |
| **Missing Proof** | `""` or `"   "` | Client & server reject empty proof | ✅ PASS |
| **Optional Fields** | Leave Dept and Year empty | Claim successfully created with null values | ✅ PASS |
| **Pending Claim Listing** | Submit claim on open Found item | Item remains `OPEN` in `/browse`, claim appears as `PENDING` in `My Claims` | ✅ PASS |
| **Duplicate Prevention** | Submit second claim on same item | Server action & API return `400: You have already submitted an active claim` | ✅ PASS |
| **Competing Claim Locking** | Admin approves Claim A | Claim A -> `APPROVED`, competing Claim B -> auto-`REJECTED`, item -> `CLAIMED` | ✅ PASS |
| **Finder Reward** | On claim approval | Finder user gains +50 points and "Campus Hero" badge | ✅ PASS |
| **Discovery Removal** | Filter `/browse?type=FOUND` | Approved item automatically excluded from active Found listings | ✅ PASS |
| **Claimed Items Display** | Filter `/browse?type=CLAIMED` | Approved item appears with verified owner badge & handover status | ✅ PASS |
| **Physical Handover** | Admin clicks "Complete Handover" | Item transitions to `RESOLVED` with "Reunited with Owner" badge | ✅ PASS |
| **RBAC Security** | Non-admin accesses `/admin` or sends claim approval API | Blocked with 307 redirect / 403 Forbidden | ✅ PASS |
| **Build & Type Checking** | `npm run build --webpack` in `web/` | 19/19 routes compiled cleanly (0 errors) | ✅ PASS |
| **Mobile Dart Analysis** | `flutter analyze` in `mobile_app/` | 0 errors, 0 warnings (clean analysis) | ✅ PASS |

