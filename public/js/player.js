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
  open({ id, type = 'movie', title, name, poster_path, backdrop_path, season = 1, episode = 1 }) {
    const displayTitle = title || name || (type === 'tv' ? 'TV Series' : 'Movie');
    const savedProgress = Storage.getProgress(id, type, season, episode);

    this.activeContent = {
      id,
      type,
      title: displayTitle,
      poster_path,
      backdrop_path,
      season: Number(season),
      episode: Number(episode)
    };

    // Save initial progress record immediately
    Storage.saveWatchProgress({
      id,
      type,
      title: displayTitle,
      poster_path,
      backdrop_path,
      season,
      episode,
      timestamp: savedProgress,
      progress: savedProgress > 0 ? 5 : 0
    });

    const embedUrl = this.buildEmbedUrl({
      id,
      type,
      season,
      episode,
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
      // 1. Parse data whether it arrives as a string or an object
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return; // Ignore non-JSON strings
        }
      }

      if (!data || typeof data !== 'object') return;

      // 2. Validate payload from Vidstuck player
      // Structure: { id, type, progress, timestamp, duration, season, episode }
      if (data.id && (data.progress !== undefined || data.timestamp !== undefined)) {
        const content = this.activeContent || {};

        const currentSeason = Number(data.season || content.season || 1);
        const currentEpisode = Number(data.episode || content.episode || 1);

        // 3. Keep Player.activeContent in sync with player's internal episode picker
        if (this.activeContent) {
          this.activeContent.season = currentSeason;
          this.activeContent.episode = currentEpisode;
        }

        // 4. Update the player header badge & side buttons
        const badgeEl = document.getElementById('player-badge');
        if (badgeEl && (data.type === 'tv' || content.type === 'tv')) {
          badgeEl.textContent = `S${currentSeason}:E${currentEpisode}`;
        }

        const prevBtn = document.getElementById('player-prev-btn');
        if (prevBtn) {
          prevBtn.disabled = currentEpisode <= 1;
        }

        // 5. Save the watch progress and new episode to localStorage
        Storage.saveWatchProgress({
          id: data.id,
          type: data.type || content.type || 'movie',
          title: content.title,
          poster_path: content.poster_path,
          backdrop_path: content.backdrop_path,
          progress: data.progress,
          timestamp: data.timestamp,
          duration: data.duration,
          season: currentSeason,
          episode: currentEpisode
        });

        // Update in-player progress indicator
        const progressIndicator = document.getElementById('player-progress-text');
        if (progressIndicator && data.progress) {
          progressIndicator.textContent = `${Math.round(data.progress)}% watched`;
        }
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
