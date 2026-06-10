# Zones Mess Menu App — Build Instructions for Codex

A web app for Zones Islamabad office employees to view the daily mess menu and rate meals.

---

## 1. What the App Does

- Shows today's date
- Displays the daily mess menu in a table: Timings, Meal (Breakfast/Lunch/Dinner), and Menu items
- Each meal shows its average rating and total vote count
- Employees can rate a meal once per day
- Ratings require login (to prevent duplicates)

---

## 2. Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Firestore
- **Auth:** Firebase Auth with Google Sign-In
- **Hosting:** Firebase Hosting

---

## 3. Pages & Components

### Pages
- **Home** — the only page; shows today's date, the menu table, and handles rating

### Components
- **Navbar** — logo on the left, app title "Zones Mess Menu" in the center, hamburger menu on the right
- **MenuTable** — table with three rows (Breakfast, Lunch, Dinner), each showing timings, meal name, menu items, average rating, vote count, and a Rate button
- **RateModal** — popup that appears when Rate is clicked; shows a 1–10 input and a submit button; requires the user to be signed in

---

## 4. Firestore Collections

### `menu`
- One document per day, document ID is the date in YYYY-MM-DD format
- Each document has three fields: breakfast, lunch, dinner
- Each field contains: items (what's being served), start time, end time

### `ratings`
- One document per user per meal per day
- Document ID format: `YYYY-MM-DD_mealType_userEmail`
- Each document stores: meal type, date, user email, and score (1–10)

---

## 5. App Behavior

- On load, fetch today's menu document from Firestore
- If no document exists for today, show a "Menu not available" message
- For each meal, query all ratings for that meal and date, then compute and display the average and count
- When a user clicks Rate:
  - If not signed in, trigger Google Sign-In popup first
  - If already rated today, show their existing score and disable the button
  - Otherwise show the RateModal to submit
- Rating submission uses the document ID format to enforce one rating per user per meal per day

---

## 6. Security Rules

- Menu collection: public read, no client writes (admin adds menu via Firebase Console)
- Ratings collection: public read, authenticated write only, users can only write documents where the email in the document matches their own

---

## 7. How Menu Data Is Added

Menu is added manually by the admin through the Firebase Console each day:
- Navigate to the `menu` collection
- Create a document with today's date as the ID
- Fill in breakfast, lunch, and dinner fields with items and timings

---

## 8. Design

- Clean, minimal table layout similar to the NUST Mess Menu reference app
- Zones brand colors: primary blue `#0057A8`, accent orange `#F26522`
- White card background, light grey page background
- Mobile-first, fully responsive
- Font: Inter

---

## 9. Deployment

- Build with Vite, deploy to Firebase Hosting
- Single command deployment: build then firebase deploy
- Firebase project needs Firestore, Authentication (Google provider), and Hosting enabled
- All Firebase config values go in a `.env.local` file and are prefixed with `VITE_`

---

## 10. Phase 2 (Future)

- Admin page for adding daily menu from the browser instead of Firebase Console
- Weekly menu view
- Meal history and rating trends
