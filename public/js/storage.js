// Storage controller for Watch History, Continue Watching, Watchlist, and User Settings
const Storage = {
  KEYS: {
    HISTORY: 'cinestuck_watch_history',
    WATCHLIST: 'cinestuck_watchlist',
    SETTINGS: 'cinestuck_settings'
  },

  DEFAULT_SETTINGS: {
    branding: 'VIDSTUCK',
    playerColor: 'E50914', // Netflix Red default
    subtitle: 'english',
    server: '',
    tmdbApiKey: '',
    autoplayNext: true,
    overlay: true,
    episodeSelector: true
  },

  // --- Watch History & Progress ---
  getWatchHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read watch history:', e);
      return [];
    }
  },

  saveWatchProgress({ id, type, title, poster_path, backdrop_path, progress, timestamp, duration, season, episode }) {
    if (!id) return;
    const history = this.getWatchHistory();
    const existingIndex = history.findIndex(item => item.id == id && item.type == type);

    const record = {
      id,
      type: type || 'movie',
      title: title || (type === 'tv' ? `TV Show #${id}` : `Movie #${id}`),
      poster_path,
      backdrop_path,
      progress: Math.min(100, Math.max(0, Math.round(progress || 0))),
      timestamp: Math.round(timestamp || 0),
      duration: Math.round(duration || 0),
      season: season ? Number(season) : 1,
      episode: episode ? Number(episode) : 1,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      // Retain poster/title if not passed in progress event
      record.title = title || history[existingIndex].title;
      record.poster_path = poster_path || history[existingIndex].poster_path;
      record.backdrop_path = backdrop_path || history[existingIndex].backdrop_path;
      history.splice(existingIndex, 1);
    }

    // Insert at front
    history.unshift(record);

    // Limit to 40 items
    if (history.length > 40) history.pop();

    try {
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save watch history:', e);
    }
  },

  getProgress(id, type, season, episode) {
    const history = this.getWatchHistory();
    const item = history.find(h => {
      if (h.id != id || h.type != type) return false;
      if (type === 'tv' && season && episode) {
        return h.season == season && h.episode == episode;
      }
      return true;
    });
    return item ? item.timestamp : 0;
  },

  clearWatchHistory() {
    localStorage.removeItem(this.KEYS.HISTORY);
  },

  // --- Watchlist ---
  getWatchlist() {
    try {
      const data = localStorage.getItem(this.KEYS.WATCHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isInWatchlist(id, type) {
    const list = this.getWatchlist();
    return list.some(item => item.id == id && item.type == type);
  },

  toggleWatchlist(item) {
    const list = this.getWatchlist();
    const index = list.findIndex(i => i.id == item.id && i.type == item.type);
    let added = false;

    if (index >= 0) {
      list.splice(index, 1);
      added = false;
    } else {
      list.unshift({
        id: item.id,
        type: item.type || (item.name ? 'tv' : 'movie'),
        title: item.title || item.name,
        name: item.name || item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        overview: item.overview,
        addedAt: Date.now()
      });
      added = true;
    }

    localStorage.setItem(this.KEYS.WATCHLIST, JSON.stringify(list));
    return added;
  },

  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? { ...this.DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...this.DEFAULT_SETTINGS };
    } catch (e) {
      return { ...this.DEFAULT_SETTINGS };
    }
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
};
