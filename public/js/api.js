// API Client for CineStuck backend and TMDB
const API = {
  baseUrl: '',

  getHeaders() {
    const settings = Storage.getSettings();
    const headers = { 'Content-Type': 'application/json' };
    if (settings.tmdbApiKey && settings.tmdbApiKey.trim()) {
      headers['x-tmdb-key'] = settings.tmdbApiKey.trim();
    }
    return headers;
  },

  async getConfig() {
    try {
      const res = await fetch(`${this.baseUrl}/api/config`);
      return await res.json();
    } catch (e) {
      return { status: 'fallback', serverKeyConfigured: false, defaultBranding: 'VIDSTUCK' };
    }
  },

  async getTrending() {
    try {
      const res = await fetch(`${this.baseUrl}/api/trending`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results;
      }
    } catch (e) {
      console.warn('Using curated trending fallback:', e.message);
    }
    // Return curated fallback
    return [...CURATED_CATALOG.movies.slice(0, 6), ...CURATED_CATALOG.tvShows.slice(0, 4)];
  },

  async getPopularMovies(page = 1) {
    try {
      const res = await fetch(`${this.baseUrl}/api/movies/popular?page=${page}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results.map(m => ({ ...m, type: 'movie' }));
      }
    } catch (e) {
      console.warn('Using curated movies fallback:', e.message);
    }
    return CURATED_CATALOG.movies;
  },

  async getTopRatedMovies(page = 1) {
    try {
      const res = await fetch(`${this.baseUrl}/api/movies/top_rated?page=${page}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results.map(m => ({ ...m, type: 'movie' }));
      }
    } catch (e) {}
    return [...CURATED_CATALOG.movies].sort((a, b) => b.vote_average - a.vote_average);
  },

  async getPopularTV(page = 1) {
    try {
      const res = await fetch(`${this.baseUrl}/api/tv/popular?page=${page}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results.map(t => ({ ...t, type: 'tv' }));
      }
    } catch (e) {}
    return CURATED_CATALOG.tvShows;
  },

  async getTopRatedTV(page = 1) {
    try {
      const res = await fetch(`${this.baseUrl}/api/tv/top_rated?page=${page}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results.map(t => ({ ...t, type: 'tv' }));
      }
    } catch (e) {}
    return [...CURATED_CATALOG.tvShows].sort((a, b) => b.vote_average - a.vote_average);
  },

  async search(query, type = 'multi') {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetch(`${this.baseUrl}/api/search?q=${encodeURIComponent(query)}&type=${type}`, {
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results.filter(item => item.media_type !== 'person');
      }
    } catch (e) {}

    // Fallback: search in curated catalog
    const q = query.toLowerCase();
    const all = [...CURATED_CATALOG.movies, ...CURATED_CATALOG.tvShows];
    return all.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      const matchType = type === 'multi' || item.type === type;
      return matchType && (title.includes(q) || overview.includes(q));
    });
  },

  async getDetails(type, id) {
    try {
      const res = await fetch(`${this.baseUrl}/api/details/${type}/${id}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && !data.fallbackNeeded && data.id) {
        return { ...data, type };
      }
    } catch (e) {}

    // Find in curated catalog
    const list = type === 'tv' ? CURATED_CATALOG.tvShows : CURATED_CATALOG.movies;
    const found = list.find(item => item.id == id);
    if (found) return { ...found, type };

    // Default object with basic info
    return {
      id,
      type,
      title: type === 'tv' ? `TV Show #${id}` : `Movie #${id}`,
      name: type === 'tv' ? `TV Show #${id}` : `Movie #${id}`,
      overview: 'Metadata unavailable. Stream directly using TMDB ID via Vidstuck.',
      vote_average: 7.5,
      release_date: new Date().toISOString().split('T')[0]
    };
  },

  async getSeasonEpisodes(id, seasonNumber) {
    try {
      const res = await fetch(`${this.baseUrl}/api/tv/${id}/season/${seasonNumber}`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data && data.episodes && data.episodes.length > 0) {
        return data.episodes;
      }
    } catch (e) {}

    // Find show in curated catalog
    const show = CURATED_CATALOG.tvShows.find(s => s.id == id);
    const season = show?.seasons?.find(s => s.season_number == seasonNumber);
    const count = season?.episode_count || 10;
    return generateMockEpisodes(id, seasonNumber, count);
  }
};
