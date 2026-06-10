# 🍽️ Zones Mess Menu

A web app for the **Zones LLC Islamabad office** to view the monthly mess (cafeteria) food menu. Built with React and Supabase.

---

## ✨ Features

- 📅 Browse the full monthly food menu by week and day
- ⭐ Rate dinners and view rating summaries
- 💬 Submit feedback/queries to the admin
- 🔐 Supabase Authentication (Google Sign-in) for staff access
- ☁️ Supabase PostgreSQL backend for real-time menu data, ratings, and queries
- 📱 Responsive design — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TanStack Start & Router |
| Styling | Tailwind CSS, shadcn/ui (Radix) |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (OAuth Google) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- Supabase project set up

### Installation

```bash
# Clone the repository
git clone https://github.com/sa1ffffff/zones_mess_menu.git
cd zones_mess_menu

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory and add your Supabase config:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## 📁 Project Structure

```text
zones_mess_menu/
├── src/
│   ├── components/       # Reusable UI components (shadcn etc.)
│   ├── integrations/     # Supabase client and types
│   ├── lib/              # Utilities, data fetching, menu parsing
│   └── routes/           # TanStack file-based routing
├── public/               # Static assets
├── supabase/             # Supabase migrations
├── .env                  # Supabase credentials (not committed)
├── package.json
└── README.md
```

---

## 🔐 Authentication

Users log in via Supabase Auth using their Google accounts. Authenticated users can rate meals and access specific features.

---

## 🗃️ Database Structure (Supabase)

- **dinners**: Stores the daily food menus (date, time_start, time_end, menu_items).
- **ratings**: Stores user ratings for dinners.
- **queries**: Stores user feedback and queries submitted from the app.

*Note: The app displays the active menu from hardcoded data in `src/lib/menu-data.ts`. The admin panel allows uploading markdown files to parse into the `dinners` table.*

---

## 📦 Deployment

Deploy using Vite and your preferred Node.js hosting provider.

```bash
npm run build
```

---

## 🤝 Contributing

This is an internal tool for Zones LLC Islamabad. For changes or additions to the menu data or UI, raise a request with the developer.

---

## 👤 Author

**Saif Ullah Waseem**  
Account Executive, Zones LLC — Islamabad  
[saifullahwaseem.dev](https://saifullahwaseem.dev) · [GitHub](https://github.com/sa1ffffff)
