# FinDora Mobile App — SVKM DJSCE Campus Lost & Found

> **Flutter 3.x / Dart Mobile Application (ADF Track)**  
> Developed for **Dwarkadas J. Sanghvi College of Engineering**

---

## 📱 Features

- **Gemini AI Matcher & Auto-Categorization:** Uses Google Gemini assistance (`GeminiService`) to automatically detect categories from descriptions and compute semantic match confidence between lost and found items.
- **Interactive Swipe Discovery:** Swipe right to mark as potential match, swipe left to pass, with smooth physics and instant in-app chat launch.
- **Strict Verification Claim Workflow:**
  - Compulsory `@svkmmumbai.onmicrosoft.com` email verification.
  - College Roll Number regex validation: `^[A-Za-z][0-9]{3}$` (e.g., `A090`, `B007`).
  - SVKM SAP ID regex validation: `^6[0-9]{10,11}$` (11–12 digits starting with 6).
  - Substantive proof of ownership requirement (minimum 5 characters).
  - Real-time `_existingClaim` live status banner with quoted proof and Ground Floor Security Desk (Gate 2) handover instructions.
- **Admin vs Student Portal Separation:**
  - Student Profile houses the private "My Submitted Claims" queue, reward points, and badge tiers.
  - Admin Profile completely omits student claims, providing Faculty Admin credentials, system authority status, and quick launch to the **Admin Security Console**.
- **Monochrome Line Icons Design System:** 100% clean vector outline icons (`Icons.*_outlined`) replacing colorful OS emojis for a unified aesthetic.
- **SVKM Handover Protocol:** Safety reminders guiding students to exchange belongings at the Ground Floor Security Desk (Gate 2) or Central Library.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Flutter SDK 3.x installed
- Android Studio / VS Code with Flutter extension
- Connected Android device (e.g. via USB debugging) or Android Emulator

### 2. Connect to Local Backend
The app connects to the Next.js backend server. Configure the server IP in **Profile > Server Connection (IP / USB)**:
- **Physical Device over USB:** `localhost` (run `adb reverse tcp:3000 tcp:3000`)
- **Android Emulator:** `10.0.2.2`
- **Wi-Fi LAN:** Local machine IP (e.g., `192.168.1.x:3000`)

### 3. Launch App
```bash
cd mobile_app
flutter pub get
flutter run
```

---

## 🧪 Static Analysis & Code Quality
```bash
flutter analyze
```
*Current Status: 0 errors, 0 warnings (100% clean).*
