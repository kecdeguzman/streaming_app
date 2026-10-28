// Vidstuck Player Integration Controller
const Player = {
  activeContent: null,
  iframeElement: null,
  containerElement: null,

  init() {
    this.containerElement = document.getElementById('player-modal');
    this.setupPostMessageListener();
    this.setupKeyboardShortcuts();
  },

  // Generates the Vidstuck embed URL
  buildEmbedUrl({ id, type, season = 1, episode = 1, progress = 0 }) {
    const settings = Storage.getSettings();
    const domain = 'vidstuck.cc';
    let url = '';

    if (type === 'tv') {
      url = `https://${domain}/embed/tv/${id}/${season}/${episode}`;
    } else {
      url = `https://${domain}/embed/movie/${id}`;
    }

    const params = new URLSearchParams();

    // Custom branding
    if (settings.branding && settings.branding.trim()) {
      params.set('branding', settings.branding.trim());
    }

    // Accent color (strip # if present)
    if (settings.playerColor) {
      params.set('color', settings.playerColor.replace('#', ''));
    }

    // Subtitle language
    if (settings.subtitle) {
      params.set('subtitle', settings.subtitle);
    }

    // Server selection (e.g. valstrax)
    if (settings.server) {
      params.set('server', settings.server);
    }

    // Resume progress (timestamp in seconds)
    if (progress && progress > 5) {
      params.set('progress', Math.round(progress));
    }

    // TV Series specific features
    if (type === 'tv') {
      if (settings.episodeSelector) params.set('episodeSelector', 'true');
      if (settings.autoplayNext) params.set('autoplayNextEpisode', 'true');
      params.set('nextEpisode', 'true');
      if (settings.overlay) params.set('overlay', 'true');
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  },

  // Open player in modal
  open({ id, type = 'movie', title, name, poster_path, backdrop_path, season, episode }) {
    const displayTitle = title || name || (type === 'tv' ? 'TV Series' : 'Movie');

    // Look up existing history entry to get the last watched episode if none passed
    const historyItem = Storage.getWatchHistory().find(h => h.id == id && h.type == type);

    const targetSeason = Number(season || historyItem?.season || 1);
    const targetEpisode = Number(episode || historyItem?.episode || 1);
    const savedProgress = Storage.getProgress(id, type, targetSeason, targetEpisode);

    this.activeContent = {
      id,
      type,
      title: displayTitle,
      poster_path,
      backdrop_path,
      season: targetSeason,
      episode: targetEpisode
    };

    Storage.saveWatchProgress({
      id,
      type,
      title: displayTitle,
      poster_path,
      backdrop_path,
      season: targetSeason,
      episode: targetEpisode,
      timestamp: savedProgress,
      progress: savedProgress > 0 ? 5 : 0
    });

    const embedUrl = this.buildEmbedUrl({
      id,
      type,
      season: targetSeason,
      episode: targetEpisode,
      progress: savedProgress
    });

    this.renderPlayerModal(embedUrl);
  },

  renderPlayerModal(embedUrl) {
    const content = this.activeContent;
    const settings = Storage.getSettings();
    const isTV = content.type === 'tv';

    const playerContainer = document.getElementById('player-iframe-wrapper');
    const titleEl = document.getElementById('player-title');
    const badgeEl = document.getElementById('player-badge');
    const tvEpisodeNav = document.getElementById('player-tv-nav');
    const serverSelect = document.getElementById('player-server-select');

    if (titleEl) {
      titleEl.textContent = content.title;
    }

    if (badgeEl) {
      badgeEl.textContent = isTV
        ? `S${content.season}:E${content.episode}`
        : 'Movie';
    }

    if (serverSelect) {
      serverSelect.value = settings.server || '';
    }

    // Populate TV navigation if watching TV show
    // if (tvEpisodeNav) {
    //   if (isTV) {
    //     tvEpisodeNav.classList.remove('hidden');
    //     this.renderEpisodeButtons(content.id, content.season, content.episode);
    //   } else {
    //     tvEpisodeNav.classList.add('hidden');
    //   }
    // }

    // Inject iframe
    playerContainer.innerHTML = `
      <iframe
        id="vidstuck-stream-frame"
        src="${embedUrl}"
        class="w-full h-full border-0 absolute inset-0"
        allowfullscreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    `;

    this.iframeElement = document.getElementById('vidstuck-stream-frame');
    this.containerElement.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  },

  async renderEpisodeButtons(showId, currentSeason, currentEpisode) {
    const container = document.getElementById('player-episodes-strip');
    if (!container) return;

    container.innerHTML = '<span class="text-xs text-zinc-400">Loading episodes...</span>';

    try {
      const episodes = await API.getSeasonEpisodes(showId, currentSeason);
      container.innerHTML = '';

      episodes.forEach(ep => {
        const isCurrent = ep.episode_number == currentEpisode;
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${isCurrent
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold scale-105'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
          }`;
        btn.textContent = `Ep ${ep.episode_number}: ${ep.name ? ep.name.slice(0, 18) : ''}`;
        btn.title = ep.overview || `Episode ${ep.episode_number}`;
        btn.onclick = () => {
          this.switchEpisode(currentSeason, ep.episode_number);
        };
        container.appendChild(btn);
      });
    } catch (e) {
      container.innerHTML = '<span class="text-xs text-zinc-500">Episode list unavailable</span>';
    }
  },

  switchEpisode(season, episode) {
    if (!this.activeContent) return;
    this.activeContent.season = Number(season);
    this.activeContent.episode = Number(episode);

    const embedUrl = this.buildEmbedUrl({
      id: this.activeContent.id,
      type: 'tv',
      season,
      episode,
      progress: 0
    });

    this.renderPlayerModal(embedUrl);
  },

  switchServer(serverName) {
    if (!this.activeContent) return;
    Storage.saveSettings({ server: serverName });
    const savedProgress = Storage.getProgress(
      this.activeContent.id,
      this.activeContent.type,
      this.activeContent.season,
      this.activeContent.episode
    );

    const embedUrl = this.buildEmbedUrl({
      ...this.activeContent,
      progress: savedProgress
    });

    if (this.iframeElement) {
      this.iframeElement.src = embedUrl;
    }
  },

  close() {
    if (this.containerElement) {
      this.containerElement.classList.add('hidden');
    }
    const playerContainer = document.getElementById('player-iframe-wrapper');
    if (playerContainer) {
      playerContainer.innerHTML = ''; // Stops playback and frees memory
    }
    document.body.classList.remove('overflow-hidden');
    this.activeContent = null;

    // Refresh Continue Watching row on main page
    if (typeof App !== 'undefined' && App.renderContinueWatching) {
      App.renderContinueWatching();
    }
  },

  setupPostMessageListener() {
    window.addEventListener('message', (event) => {
      if (!event.data) return;

      let payload = event.data;

      // Handle stringified JSON
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          return; // Ignore regular string messages
        }
      }

      if (typeof payload !== 'object' || payload === null) return;

      // Some embed players nest payload details under 'data' or 'detail'
      const info = payload.data || payload.detail || payload;

      // Check for season & episode across multiple common naming conventions
      const season = info.season ?? info.currentSeason ?? info.season_number;
      const episode = info.episode ?? info.currentEpisode ?? info.episode_number ?? info.ep;

      // Check for progress / timestamp
      const progress = info.progress ?? info.percentage;
      const timestamp = info.timestamp ?? info.currentTime ?? info.time;
      const duration = info.duration ?? info.totalTime;

      // Only process if we got episode info OR playback progress
      if (episode !== undefined || progress !== undefined || timestamp !== undefined) {
        const content = this.activeContent || {};

        const currentSeason = season !== undefined ? Number(season) : Number(content.season || 1);
        const currentEpisode = episode !== undefined ? Number(episode) : Number(content.episode || 1);

        // 1. Sync active content memory
        if (this.activeContent) {
          this.activeContent.season = currentSeason;
          this.activeContent.episode = currentEpisode;
        }

        // 2. Update UI badge in top navigation
        const badgeEl = document.getElementById('player-badge');
        if (badgeEl && (content.type === 'tv' || info.type === 'tv')) {
          badgeEl.textContent = `S${currentSeason}:E${currentEpisode}`;
        }

        // 3. Update side Previous button state
        const prevBtn = document.getElementById('player-prev-btn');
        if (prevBtn) {
          prevBtn.disabled = currentEpisode <= 1;
        }

        // 4. Update duration/percentage label if present
        const progressIndicator = document.getElementById('player-progress-text');
        if (progressIndicator && progress !== undefined) {
          progressIndicator.textContent = `${Math.round(progress)}% watched`;
        }

        // 5. Persist progress & episode to storage
        Storage.saveWatchProgress({
          id: info.id || content.id,
          type: info.type || content.type || 'tv',
          title: content.title,
          poster_path: content.poster_path,
          backdrop_path: content.backdrop_path,
          progress: progress !== undefined ? Math.round(progress) : (content.progress || 0),
          timestamp: timestamp !== undefined ? Math.round(timestamp) : 0,
          duration: duration !== undefined ? Math.round(duration) : 0,
          season: currentSeason,
          episode: currentEpisode
        });
      }
    });
  },

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.containerElement && !this.containerElement.classList.contains('hidden')) {
        this.close();
      }
    });
  }
};
