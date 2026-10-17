const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const VIDSTUCK_HOST = 'https://vidstuck.cc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory cache with TTL (15 minutes)
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Helper to resolve TMDB API key from request or env
function getTmdbApiKey(req) {
  return req.headers['x-tmdb-key'] || req.query.api_key || process.env.TMDB_API_KEY || null;
}

// Generic TMDB fetcher
async function fetchTmdb(endpoint, params = {}, apiKey = null) {
  if (!apiKey) return null;
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && k !== 'api_key') {
      url.searchParams.set(k, v);
    }
  }

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    timeout: 8000
  });

  if (!res.ok) {
    throw new Error(`TMDB responded with status ${res.status}`);
  }

  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

// Vidstuck proxy fallback for popular content
async function fetchVidstuckPopular(page = 1) {
  const cacheKey = `vidstuck_popular_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${VIDSTUCK_HOST}/backend/tmdb/popular?page=${page}`, {
    headers: { 'Accept': 'application/json' },
    timeout: 8000
  });

  if (!res.ok) {
    throw new Error(`Vidstuck proxy responded with status ${res.status}`);
  }

  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// 1. Health check & Configuration
app.get('/api/config', (req, res) => {
  const serverKeyConfigured = Boolean(process.env.TMDB_API_KEY);
  res.json({
    status: 'ok',
    serverKeyConfigured,
    vidstuckHost: VIDSTUCK_HOST,
    defaultBranding: 'KAIRN',
    availableServers: [
      { id: '', name: 'Default Server (Auto)' },
      { id: 'valstrax', name: 'Valstrax' },
      { id: 'alpha', name: 'Alpha Fast' },
      { id: 'omega', name: 'Omega Backup' }
    ]
  });
});

// 2. Popular Movies (Using TMDB if key available, else Vidstuck Proxy)
app.get('/api/movies/popular', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb('/movie/popular', { page }, apiKey);
      return res.json(data);
    }

    // Fallback: Vidstuck backend proxy
    const data = await fetchVidstuckPopular(page);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching popular movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch popular movies', message: err.message });
  }
});

// 3. Trending (Movies & TV)
app.get('/api/trending', async (req, res) => {
  const timeWindow = req.query.time || 'week'; // 'day' or 'week'
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb(`/trending/all/${timeWindow}`, {}, apiKey);
      return res.json(data);
    }

    // Fallback to Vidstuck popular page 1
    const data = await fetchVidstuckPopular(1);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching trending:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending', message: err.message });
  }
});

// 4. Top Rated Movies
app.get('/api/movies/top_rated', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb('/movie/top_rated', { page }, apiKey);
      return res.json(data);
    }
    const data = await fetchVidstuckPopular(2);
    return res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top rated movies', message: err.message });
  }
});

// 5. Popular TV Shows
app.get('/api/tv/popular', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb('/tv/popular', { page }, apiKey);
      return res.json(data);
    }
    // Return empty results with fallback flag if no TMDB key
    return res.json({ results: [], fallbackNeeded: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch TV shows', message: err.message });
  }
});

// 6. Top Rated TV Shows
app.get('/api/tv/top_rated', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb('/tv/top_rated', { page }, apiKey);
      return res.json(data);
    }
    return res.json({ results: [], fallbackNeeded: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top rated TV shows', message: err.message });
  }
});

// 7. Search (Multi, Movies, TV)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const type = req.query.type || 'multi'; // multi, movie, tv
  const page = parseInt(req.query.page, 10) || 1;
  const apiKey = getTmdbApiKey(req);

  if (!query) {
    return res.status(400).json({ error: 'Search query "q" is required' });
  }

  try {
    if (apiKey) {
      const endpoint = type === 'movie' ? '/search/movie' : (type === 'tv' ? '/search/tv' : '/search/multi');
      const data = await fetchTmdb(endpoint, { query, page }, apiKey);
      return res.json(data);
    }
    return res.json({ results: [], fallbackNeeded: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute search', message: err.message });
  }
});

// 8. Details (Movie or TV) with credits, videos, and recommendations
app.get('/api/details/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb(`/${type}/${id}`, {
        append_to_response: 'videos,credits,similar,recommendations'
      }, apiKey);
      return res.json(data);
    }
    return res.json({ fallbackNeeded: true, id, type });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch details', message: err.message });
  }
});

// 9. TV Season Episodes List
app.get('/api/tv/:id/season/:seasonNumber', async (req, res) => {
  const { id, seasonNumber } = req.params;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const data = await fetchTmdb(`/tv/${id}/season/${seasonNumber}`, {}, apiKey);
      return res.json(data);
    }
    return res.json({ fallbackNeeded: true, id, seasonNumber });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch season details', message: err.message });
  }
});

// 10. Discover by Genre / Category
app.get('/api/discover', async (req, res) => {
  const { type = 'movie', genre, sort_by = 'popularity.desc', page = 1 } = req.query;
  const apiKey = getTmdbApiKey(req);

  try {
    if (apiKey) {
      const params = {
        sort_by,
        page,
        with_genres: genre || undefined
      };
      const data = await fetchTmdb(`/discover/${type}`, params, apiKey);
      return res.json(data);
    }
    return res.json({ results: [], fallbackNeeded: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to discover media', message: err.message });
  }
});

// Support Netlify Serverless Functions URL prefix
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// All other unmatched routes go to frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🎬 CineStuck Streaming Server is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🍿 Player Provider: Vidstuck (vidstuck.cc)`);
    console.log(`===============================================`);
  });
}

module.exports = app;

