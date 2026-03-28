# ⛳ Golf Charity Subscription Platform

A full-stack web application where golf enthusiasts subscribe to enter charity draws using their real golf scores. A portion of subscription revenue goes to selected charities, while winners are drawn based on score-matching logic.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Admin Dashboard Access](#-admin-dashboard-access)
- [API Overview](#-api-overview)

---

## 🛠 Tech Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| **Frontend** | React 19, React Router, TailwindCSS, Radix UI, Framer Motion |
| **Backend**  | Python, FastAPI, Uvicorn                                   |
| **Database** | MongoDB Atlas (via Motor async driver)                     |
| **Payments** | Stripe Checkout                                            |
| **Emails**   | SendGrid                                                   |
| **Auth**     | JWT (PyJWT + bcrypt)                                       |

---

## ✨ Features

- **User Authentication** — Sign up, log in, JWT-based session management
- **Subscription Plans** — Monthly ($9.99) and Yearly ($99.99) plans via Stripe Checkout
- **Golf Score Tracking** — Submit up to 5 scores (1–45 range) used as draw entry numbers
- **Charity Directory** — Browse, search, and donate directly to charities
- **Charity Draw System** — Enter scheduled draws with your scores; winners matched against drawn numbers
- **Winner Verification & Payouts** — Proof submission and admin-managed payout workflow
- **Admin Dashboard** — Full management of users, charities, draws, scores, and payouts
- **Leaderboard** — View top performers across the platform
- **Email Notifications** — Automated emails for subscription confirmations and draw results

---

## 📌 Prerequisites

Make sure you have the following installed on your machine:

| Tool       | Version   | Download Link                                    |
| ---------- | --------- | ------------------------------------------------ |
| **Node.js**  | v18+      | [nodejs.org](https://nodejs.org/)                |
| **Python**   | 3.10+     | [python.org](https://www.python.org/downloads/)  |
| **Git**      | Latest    | [git-scm.com](https://git-scm.com/)             |

> [!NOTE]
> You also need a **MongoDB Atlas** account (free tier works), a **Stripe** account (test mode), and optionally a **SendGrid** account for email notifications.

---

## 📁 Project Structure

```
Golfwebsite/
├── backend/
│   ├── .env              # Backend environment variables
│   ├── server.py          # FastAPI application (all routes)
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Python virtual environment (created locally)
├── frontend/
│   ├── .env              # Frontend environment variables
│   ├── package.json       # Node dependencies & scripts
│   ├── tailwind.config.js # TailwindCSS configuration
│   ├── craco.config.js    # CRA override config
│   ├── public/            # Static assets
│   └── src/
│       └── pages/
│           ├── LandingPage.js
│           ├── LoginPage.js
│           ├── SignupPage.js
│           ├── DashboardPage.js
│           ├── SubscriptionPage.js
│           ├── CharityDirectoryPage.js
│           ├── LeaderboardPage.js
│           ├── AdminDashboard.js
│           └── ...
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ketan-Gehlot/Golfwebsite.git
cd Golfwebsite
```

---

### 2. Backend Setup

#### a) Create and activate a virtual environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (CMD):
venv\Scripts\activate.bat

# On macOS / Linux:
source venv/bin/activate
```

#### b) Install Python dependencies

```bash
pip install -r requirements.txt
```

#### c) Configure environment variables

Create a `.env` file inside the `backend/` folder (or edit the existing one):

```env
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app>
DB_NAME=golf_charity_db
JWT_SECRET_KEY=your_jwt_secret_key_here
STRIPE_API_KEY=sk_test_your_stripe_secret_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDER_EMAIL=your-verified-sender@example.com
```

> [!IMPORTANT]
> - Get your **MongoDB** connection string from [MongoDB Atlas](https://cloud.mongodb.com/).
> - Get your **Stripe secret key** from [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys). Use the **test mode** key (starts with `sk_test_`).
> - **SendGrid** is optional. If not configured, the app will skip sending emails.

#### d) Start the backend server

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at **http://localhost:8000**.  
Interactive API docs are at **http://localhost:8000/docs**.

---

### 3. Frontend Setup

Open a **new terminal** window (keep the backend running).

#### a) Install Node dependencies

```bash
cd frontend
npm install
```

#### b) Configure environment variables

Create a `.env` file inside the `frontend/` folder (or edit the existing one):

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

#### c) Start the frontend dev server

```bash
npm start
```

The frontend will be available at **http://localhost:3000**.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                          | Required |
| ----------------- | ------------------------------------ | -------- |
| `MONGO_URL`       | MongoDB Atlas connection string      | ✅        |
| `DB_NAME`         | Database name                        | ✅        |
| `JWT_SECRET_KEY`  | Secret key for JWT token signing     | ✅        |
| `STRIPE_API_KEY`  | Stripe secret key (test mode)        | ✅        |
| `SENDGRID_API_KEY`| SendGrid API key for emails          | ❌        |
| `SENDER_EMAIL`    | Verified sender email for SendGrid   | ❌        |

### Frontend (`frontend/.env`)

| Variable                  | Description                       | Required |
| ------------------------- | --------------------------------- | -------- |
| `REACT_APP_BACKEND_URL`  | Backend API URL                    | ✅        |

---

## ▶️ Running the Application

Once both servers are running:

1. Open **http://localhost:3000** in your browser
2. **Sign up** for a new account
3. **Subscribe** to a plan (uses Stripe test mode — use card `4242 4242 4242 4242`, any future date, any CVC)
4. **Submit 5 golf scores** from your Dashboard
5. **Enter a draw** (admin must create a draw first)
6. **Browse charities** and optionally make a direct donation

---

## 👑 Admin Dashboard Access

To access the admin dashboard at `/admin`:

1. **Create a regular user account** via the Sign Up page
2. **Manually set the user as admin** in MongoDB Atlas:
   - Go to your cluster → **Browse Collections** → `golf_charity_db` → `users`
   - Find your user document and set `"is_admin": true`
3. **Log out and log back in** — you will now see the Admin Dashboard link

> [!TIP]
> The admin dashboard lets you manage **users**, **charities**, **draws**, **scores**, and **winner payouts** all from one place.

---

## 📡 API Overview

All API routes are prefixed with `/api`. Key endpoints:

| Method   | Endpoint                          | Description                     | Auth     |
| -------- | --------------------------------- | ------------------------------- | -------- |
| `POST`   | `/api/auth/signup`               | Register a new user              | —        |
| `POST`   | `/api/auth/login`                | Log in and get JWT token         | —        |
| `GET`    | `/api/users/me`                  | Get current user profile         | User     |
| `POST`   | `/api/subscriptions/checkout`    | Start Stripe checkout            | User     |
| `GET`    | `/api/subscriptions/plans`       | Get available plans              | —        |
| `POST`   | `/api/scores`                    | Submit a golf score              | User     |
| `GET`    | `/api/charities`                 | List all charities               | —        |
| `POST`   | `/api/donations/checkout`        | Start donation checkout          | User     |
| `POST`   | `/api/draws/{id}/enter`          | Enter a charity draw             | User     |
| `GET`    | `/api/admin/users`               | List all users                   | Admin    |
| `POST`   | `/api/admin/draws`               | Create a new draw                | Admin    |

Full interactive docs: **http://localhost:8000/docs**

---

## 📄 License

This project is for educational / demonstration purposes.
