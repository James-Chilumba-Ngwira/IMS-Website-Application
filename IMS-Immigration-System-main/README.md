# Immigration Management System for International Students (IMS-IS)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Blockchain](https://img.shields.io/badge/integrity-Blockchain%20Hashing-orange)
![ML](https://img.shields.io/badge/analytics-Machine%20Learning-purple)
![Security](https://img.shields.io/badge/security-RLS%20%2B%20JWT-red)
![Status](https://img.shields.io/badge/status-Thesis%20Prototype-informational)

A secure, blockchain-integrated and machine learning–ready immigration management platform designed to modernize the registration, verification, and visa lifecycle management of international students in Kazakhstan.

This project is developed as a full-stack academic prototype using React, Supabase, Blockchain Hashing, QR Verification, and Role-Based Access Control (RLS).

---

## 🎓 Thesis Context

Final Year Research Project:

> **Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms**

The system focuses on international students and addresses key challenges in traditional immigration systems:
- Manual visa verification processes  
- Fragmented institutional data  
- Lack of tamper-proof identity validation  
- Slow verification workflows  
- Heavy dependency on physical documents  

---

## 🚀 Key Features

### 🔐 Digital Student Identity
- Blockchain-hashed student identity records (tamper-evident)
- Digital student ID with QR verification
- Privacy-aware minimal data exposure

### 🛂 Immigration & Visa Management
- Visa lifecycle tracking (registration → approval → expiry)
- Renewal monitoring (prototype-ready)
- Centralized immigration database (simulated)

### 🏫 Institutional Integration
- Universities register and manage international students
- Compliance monitoring dashboards
- Institutional access control via RLS

### 📱 QR-Based Verification System
- Secure QR code embedded in digital ID cards
- Real-time verification via backend API
- Blockchain integrity check for authenticity validation

### 🤖 ML-Ready Architecture
- Extensible module for fraud detection
- Visa expiry prediction (future integration)
- Risk scoring pipeline support

---

## 🏗️ System Architecture

### High-Level Overview
The system follows a modular architecture where the React frontend communicates securely with a Supabase backend (PostgreSQL, Auth, and RLS).  
A blockchain integrity layer stores hashed identity records to ensure tamper-evident verification, while a QR-based interface enables real-time legitimacy checks by authorized verifiers.

```mermaid
flowchart TD
  A[International Student] --> B[React Web App]
  C[Immigration Authority] --> B
  D[Authorized Verifier] --> E[QR Verification Interface]

  B --> F[Supabase Backend]
  E --> G[Verification API]

  F --> H[PostgreSQL Database]
  H --> I[Students Table]
  H --> J[Visas Table]
  H --> K[Student Cards]
  H --> L[Audit Logs]
  H --> M[Verification Requests]

  G --> N[Blockchain Integrity Ledger]
````

---

## 🛠️ Technology Stack

### Frontend

* React + TypeScript
* Vite
* Material UI (MUI)
* TanStack Query
* React Hook Form + Zod

### Backend

* Supabase (PostgreSQL + Auth + RLS)
* Supabase Edge Functions (Verification API)
* Storage (for student documents)

### Security & Integrity

* JWT Authentication (Supabase Auth)
* Row-Level Security (RLS)
* Blockchain Hash Ledger (Prototype / Simulated)

### Mobile (Planned Extension)

* React Native (Expo compatible architecture)

---

## 👥 User Roles & Access Control

| Role                         | Permissions                                  |
| ---------------------------- | -------------------------------------------- |
| Immigration Authority        | Full system oversight, approvals, audit logs |
| Institution (University)     | Register/manage international students       |
| Authorized Verifier (Police) | QR verification (read-only access)           |
| International Student        | View digital ID and visa status              |

Access is enforced using Supabase Auth + Row-Level Security (RLS).

---

## 🔎 QR Verification Workflow

1. Student receives Digital ID Card with QR Code
2. QR contains a secure verification token
3. Verifier (Police/Authority) scans QR
4. Backend validates:

   * Token authenticity
   * Visa status & expiry
   * Student card validity
   * Blockchain hash integrity
5. System returns minimal verification data (privacy-preserving)

---

## 🔐 Database Security (RLS Enabled)

The system uses PostgreSQL Row-Level Security for strict data governance:

* Immigration: full read/write access
* Institutions: access limited to their registered students
* Verifiers: read-only verification endpoint
* Audit logs: immutable system activity tracking

---

## 📂 Project Structure

```
ims-web/
├── src/
│   ├── auth/            # Authentication & protected routes
│   ├── components/      # Reusable UI components
│   ├── pages/           # Dashboard, Login, Landing
│   ├── hooks/           # Business logic & data fetching
│   ├── lib/             # Supabase client & utilities
│   ├── types/           # DTOs & database types
│   └── router/          # Application routing
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ims-is.git
cd ims-is
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

---

## 🧪 Evaluation & Testing (Prototype)

The system can be tested using simulated datasets including:

* Student registrations
* Visa lifecycle events
* QR verification requests
* Fraud and expiry scenarios

Key evaluation metrics:

* Verification response time
* Data integrity accuracy
* RLS access enforcement
* System scalability under concurrent requests

---

## 🔬 Research Contribution

* Blockchain-integrated digital immigration identity model
* QR-based tamper-evident verification architecture
* ML-ready immigration analytics framework
* Centralized multi-stakeholder e-government prototype for Kazakhstan

---

## ⚠️ Disclaimer

This project is an academic prototype developed for research purposes.
External integrations (national immigration databases, production blockchain networks, and biometric systems) are simulated.

---

## 📜 License

MIT License – Academic & Research Use
