# 🍽️ Zones Mess Menu

A web app for the **Zones LLC Islamabad office** to view the monthly mess (cafeteria) food menu. Built with React and Firebase, deployed via Antigravity IDE.

---

## ✨ Features

- 📅 Browse the full monthly food menu by week and day
- 🔐 Firebase Authentication for staff access
- ☁️ Firestore backend for real-time menu data
- 📱 Responsive design — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Deployment | Antigravity IDE |
| Tooling | Firebase MCP, Google Stitch MCP |

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- Firebase project set up
- Access to the Zones Firebase credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/sa1ffffff/zones_mess_menu.git
cd zones_mess_menu

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
zones_mess_menu/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # App pages/views
│   ├── firebase.js       # Firebase initialization
│   └── main.jsx          # App entry point
├── public/
├── .env                  # Firebase credentials (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Authentication

Users log in via Firebase Auth. Only authenticated Zones staff members can access the menu. Contact your admin to get access.

---

## 🗃️ Firestore Data Structure

```
menu/
  └── {month_year}/         # e.g., "june_2026"
        └── weeks/
              └── {week_number}/
                    └── {day}/
                          ├── items: string[]
                          └── date: string
```

---

## 📦 Deployment

This project is deployed via **Antigravity IDE** using Firebase Hosting. To deploy manually:

```bash
npm run build
firebase deploy
```

---

## 🤝 Contributing

This is an internal tool for Zones LLC Islamabad. For changes or additions to the menu data or UI, raise a request with the developer.

---

## 👤 Author

**Saif Ullah Waseem**  
Account Executive, Zones LLC — Islamabad  
[saifullahwaseem.dev](https://saifullahwaseem.dev) · [GitHub](https://github.com/sa1ffffff)
