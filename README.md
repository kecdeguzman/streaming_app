# CineStuck — Movie & TV Streaming Web App

A modern, responsive movie and TV streaming web application powered by the **Vidstuck** (`vidstuck.cc`) embed player engine and **TMDB** metadata.

![CineStuck Banner](https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg)

---

## ✨ Features

- **Vidstuck Cinema Player (`vidstuck.cc`)**:
  - Full support for Movies (`/embed/movie/{id}`) and TV Series (`/embed/tv/{id}/{season}/{episode}`).
  - Real-time `postMessage` watch progress tracking: automatically tracks duration, timestamps, and percentages.
  - "Continue Watching" carousel with progress bars and instant "Resume Playback" at the exact second.
  - Interactive Episode Switcher strip directly inside cinema theater mode.
  - Custom player branding (`?branding=VIDSTUCK`).
  - Player accent color customization (`?color=E50914`).
  - Streaming server switching (`?server=valstrax` or auto/default).
  - Subtitle language selection (`?subtitle=english`).
  - Autoplay next episode and episode selector flags enabled.

- **Browsing & Discovery**:
  - **Hero Spotlight** with dynamic backdrops, ratings, and instant playback.
  - **Trending Now**, **Blockbuster Movies**, **Binge-Worthy TV Shows**, **Top-Rated Masterpieces**, and **Anime**.
  - **Category Filters**: Filter between All, Movies, TV Shows, Anime, and My Watchlist.
  - **Smooth Horizontal Carousels** with touch and navigation arrows.

- **Search & Details**:
  - Instant live debounced search across movies, TV shows, and anime.
  - Full details modal with high-res poster & backdrop, ratings, release date, genres, and cast list.
  - Interactive TV Show season and episode browser with episode overviews and direct play buttons.

- **Watchlist & History**:
  - Add/remove titles to "+ My List" stored persistently in `localStorage`.
  - Watch progress automatically saved and updated as you watch.

- **Zero-Friction Fallback & TMDB API Key Support**:
  - Works instantly out of the box with built-in curated blockbusters and Vidstuck's popular proxy.
  - Optional: Enter your free TMDB API key in the UI Settings modal or `.env` to unlock live search across all 1,000,000+ movies & TV shows worldwide.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Streaming Server
```bash
npm start
```
The application will launch at:
```
http://localhost:3000
```

### 3. Optional Environment Configuration (`.env`)
Create a `.env` file (copied from `.env.example`):
```env
PORT=3000
TMDB_API_KEY=your_optional_tmdb_api_key_here
DEFAULT_BRANDING=VIDSTUCK
```
*(Note: You can also enter your TMDB API Key directly in the web app UI Settings modal at any time).*

---

## 🛠️ Vidstuck Embed Specifications

### URL Patterns
- **Movies**:
  ```html
  <iframe src="https://vidstuck.cc/embed/movie/{tmdb_id}"></iframe>
  ```
- **TV Shows**:
  ```html
  <iframe src="https://vidstuck.cc/embed/tv/{tmdb_id}/{season}/{episode}"></iframe>
  ```

### Supported Parameters
| Parameter | Description | Example |
| :--- | :--- | :--- |
| `branding` | Custom text shown on loading screen | `branding=CineStuck` |
| `color` | Hex color code for player accent | `color=E50914` |
| `subtitle` | Preferred subtitle language | `subtitle=english` |
| `server` | Selects streaming server by name | `server=valstrax` |
| `progress` | Sets starting position in seconds | `progress=120` |
| `nextEpisode` | Enables the "Next Episode" button | `nextEpisode=true` |
| `episodeSelector` | Enables season & episode selector | `episodeSelector=true` |
| `autoplayNextEpisode`| Automatically plays next episode | `autoplayNextEpisode=true` |
| `overlay` | Enables Netflix-style pause overlay | `overlay=true` |

### Progress Event Listener (`postMessage`)
Vidstuck communicates playback events to the parent website:
```javascript
window.addEventListener("message", function (event) {
  if (typeof event.data !== "string") return;
  try {
    const data = JSON.parse(event.data);
    // data contains:
    // { id, type, progress, timestamp, duration, season, episode }
    console.log("Watch Progress:", data);
  } catch (e) {}
});
```

---

## 📁 Project Structure

```
streaming_app/
├── package.json               # Project manifest & start script
├── server.js                  # Express backend & TMDB caching proxy
├── .env.example               # Environment variables template
├── public/
│   ├── index.html             # Main frontend layout & modal markup
│   ├── css/
│   │   └── style.css          # Custom streaming styling & glassmorphism
│   └── js/
│       ├── api.js             # API client with TMDB & Vidstuck fallbacks
│       ├── catalog.js         # Curated catalog of blockbuster movies & shows
│       ├── storage.js         # LocalStorage watch history & watchlist manager
│       ├── player.js          # Vidstuck player embed controller & postMessage hook
│       └── app.js             # UI controller, carousels, search & modal handlers
└── README.md                  # Documentation
```

---

## 🌐 Deploying to Netlify

The app is fully configured for Netlify deployment with [`netlify.toml`](file:///d:/Code%20Projects/streaming_app/netlify.toml) and serverless functions ([`netlify/functions/api.js`](file:///d:/Code%20Projects/streaming_app/netlify/functions/api.js)).

### Method 1: Instant Drag & Drop (Netlify Drop)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the generated `cinestuck-netlify-drop.zip` (or the `public/` directory).
3. Your site will be live instantly with a free SSL `.netlify.app` URL!

### Method 2: Connect via GitHub (Automatic Deploys)
1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/streaming_app.git
   git branch -M main
   git push -u origin main
   ```
2. Log in to [app.netlify.com](https://app.netlify.com).
3. Click **Add new site** > **Import an existing project** > **GitHub**.
4. Select your repository. Netlify will automatically detect `netlify.toml` and deploy both the static frontend and serverless API proxy!

### Method 3: Netlify CLI
```bash
npx netlify-cli login
npx netlify-cli deploy --prod --dir=public
```

---

## ⚖️ Disclaimer
CineStuck is an educational front-end media aggregator that utilizes third-party iframe embed players (Vidstuck) and metadata from The Movie Database (TMDB). CineStuck does not host, upload, or control any media files.

