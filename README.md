# Rate.it

A public review platform for local service providers in Uganda. Users can search, rate, and review providers without creating an account. An admin panel handles moderation.

---

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Zustand
- Supabase (database, auth, RLS)
- Vercel (deployment)

---

## Features

**Public**
- Search providers by name using pg_trgm similarity
- Browse by category
- View provider details and approved reviews
- Submit a review anonymously or with a name
- Submit a new provider for review

**Admin**
- Login with email and password
- Dashboard with pending counts
- Approve or reject reviews
- Approve, reject, or edit providers before approving
- Manage approved providers: edit, deactivate, flag

---

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/Rate-it.git
cd rate-it
npm install
```


Run the development server:

```bash
npm run dev

## Deployment

The app is deployed on Vercel. https://rate-it-czbm.vercel.app/
