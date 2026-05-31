# 🎬 SeriesVault

### 🔗 [Live Demo Link](https://series-star-project.onrender.com/)

SeriesVault is a dynamic media tracking application designed for movie enthusiasts who want complete control over their cinematic journey. Instead of just browsing, users can actively manage their viewing history, curate upcoming releases, and visually rank their favorite content.

> ⏳ **Note on Free Hosting:** This app is hosted on a free tier. If the page takes 30–60 seconds to load initially, the server is spinning up from its sleep cycle. Thank you for your patience!

---

## 🚀 Key Features

*   **Comprehensive Movie Database:** Search, filter, and explore an extensive library of movies and series.
*   **Smart Tracking:** Mark titles as **Watched** or save them to your personal **Watchlist** with a single click.
*   **Custom Tier Lists:** Visually rank your absolute favorite movies into an 'S' to 'F' tier list creator to showcase your personal taste.
*   **Automated Release Calendar:** A dynamic dashboard displaying **Upcoming Movies** parsed directly from your Watchlist and Watched preferences so you never miss a premiere.
*   **User Authentication:** Secure user registration, login session tracking, and private dashboard management.

## 🛠️ Tech Stack & Architecture

*   **Frontend Generation:** Lovable AI Engine
*   **Frontend Framework:** React.js, TypeScript, Vite, Tailwind CSS, Shadcn UI
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth (Email/Password session management)

## ⚙️ Local Development Setup

If you wish to clone this repository and run it locally, follow these steps:

### Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   A [Supabase](https://supabase.com/) account (to connect your own database)

### Step 1: Clone the Repository
```bash
git clone https://github.com/ZdravkoIvanovBG/SeriesVault.git
cd SeriesVault
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Supabase & TMDB API

Because this app relies on live movie data, you must connect your Supabase instance and store your TMDB API key securely in your backend dashboard:

Create a new project in your Supabase Dashboard.

Run the database schema migrations (if applicable) to set up the movies, watchlist, and tier-list tables.

Navigate to your Supabase project settings and add your TMDB_API_READ_ACCESS_TOKEN to your backend environment variables/secrets so the app can fetch real-time movie details, imagery, and upcoming release dates.

### Step 4: Set Up Environment Variables
Create a .env file in the root directory of your project and paste your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### Step 5: Start the Local Server
```bash
npm run dev
```


