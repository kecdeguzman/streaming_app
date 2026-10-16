// Main Application Controller for CineStuck
const App = {
  currentFilter: 'all',
  searchDebounceTimer: null,
  activeDetailItem: null,

  async init() {
    Player.init();
    this.setupEventListeners();
    this.renderSettingsValues();

    // Load initial content rows concurrently
    await Promise.all([
      this.loadHero(),
      this.renderContinueWatching(),
      this.loadTrending(),
      this.loadPopularMovies(),
      this.loadPopularTV(),
      this.loadTopRated(),
      this.loadAnime(),
      this.renderWatchlist()
    ]);
  },

  // Setup DOM events
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        const query = e.target.value.trim();
        if (query.length < 2) {
          document.getElementById('search-results-section').classList.add('hidden');
          return;
        }
        this.searchDebounceTimer = setTimeout(() => this.performSearch(query), 350);
      });
    }

    // Filter tabs
    const navTabs = document.querySelectorAll('[data-nav-tab]');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        navTabs.forEach(t => t.classList.remove('text-red-500', 'border-b-2', 'border-red-500', 'font-bold'));
        tab.classList.add('text-red-500', 'border-b-2', 'border-red-500', 'font-bold');
        this.setFilter(tab.dataset.navTab);
      });
    });

    // Color picker in settings
    const colorInput = document.getElementById('setting-player-color');
    const colorHex = document.getElementById('setting-color-hex');
    if (colorInput && colorHex) {
      colorInput.addEventListener('input', (e) => {
        colorHex.textContent = e.target.value.toUpperCase();
      });
    }
  },

  // Hero section loader
  async loadHero() {
    const heroTitle = document.getElementById('hero-title');
    const heroOverview = document.getElementById('hero-overview');
    const heroBackdrop = document.getElementById('hero-backdrop');
    const heroRating = document.getElementById('hero-rating');
    const heroType = document.getElementById('hero-type');
    const heroWatchBtn = document.getElementById('hero-watch-btn');
    const heroInfoBtn = document.getElementById('hero-info-btn');
    const heroListBtn = document.getElementById('hero-list-btn');

    try {
      const trending = await API.getTrending();
      if (!trending || trending.length === 0) return;

      // Pick top trending item with high-res backdrop
      const featured = trending.find(item => item.backdrop_path) || trending[0];
      const title = featured.title || featured.name;
      const type = featured.title ? 'movie' : 'tv';

      if (heroTitle) heroTitle.textContent = title;
      if (heroOverview) heroOverview.textContent = featured.overview;
      if (heroRating) heroRating.textContent = `★ ${Number(featured.vote_average || 8.0).toFixed(1)}`;
      if (heroType) heroType.textContent = type === 'tv' ? 'TV SERIES' : 'MOVIE';

      if (heroBackdrop && featured.backdrop_path) {
        heroBackdrop.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${featured.backdrop_path})`;
      }

      if (heroWatchBtn) {
        heroWatchBtn.onclick = () => {
          Player.open({
            id: featured.id,
            type,
            title,
            poster_path: featured.poster_path,
            backdrop_path: featured.backdrop_path
          });
        };
      }

      if (heroInfoBtn) {
        heroInfoBtn.onclick = () => {
          this.openDetails(type, featured.id);
        };
      }

      if (heroListBtn) {
        const updateListBtn = () => {
          const inList = Storage.isInWatchlist(featured.id, type);
          heroListBtn.innerHTML = inList 
            ? `<svg class="w-5 h-5 inline mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg> In My List`
            : `<svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Add to List`;
        };
        updateListBtn();
        heroListBtn.onclick = () => {
          Storage.toggleWatchlist({ ...featured, type });
          updateListBtn();
          this.renderWatchlist();
        };
      }
    } catch (e) {
      console.warn('Hero load warning:', e);
    }
  },

  // Continue Watching Row
  renderContinueWatching() {
    const container = document.getElementById('row-continue-watching');
    const section = document.getElementById('section-continue-watching');
    if (!container || !section) return;

    const history = Storage.getWatchHistory();
    if (history.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'group relative shrink-0 w-44 md:w-56 cursor-pointer select-none';

      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';

      const progressPercent = item.progress || 0;
      const progressLabel = item.timestamp > 0 
        ? `${Math.floor(item.timestamp / 60)}m watched` 
        : `${progressPercent}%`;

      card.innerHTML = `
        <div class="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-zinc-800 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-red-600/20">
          <img src="${posterUrl}" alt="${item.title}" class="h-full w-full object-cover" loading="lazy" />
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <span class="inline-block px-1.5 py-0.5 rounded bg-red-600/90 text-[10px] font-bold uppercase tracking-wider text-white w-fit mb-1">
              ${item.type === 'tv' ? `S${item.season}:E${item.episode}` : 'Resume'}
            </span>
            <h4 class="text-xs md:text-sm font-semibold text-white truncate">${item.title}</h4>
            <span class="text-[11px] text-zinc-300">${progressLabel}</span>
          </div>

          <!-- Play button on hover -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <div class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
              <svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-700">
            <div class="h-full bg-red-600" style="width: ${progressPercent || 15}%"></div>
          </div>
        </div>
      `;

      card.onclick = () => {
        Player.open({
          id: item.id,
          type: item.type,
          title: item.title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          season: item.season || 1,
          episode: item.episode || 1
        });
      };

      container.appendChild(card);
    });
  },

  // Trending Row
  async loadTrending() {
    const items = await API.getTrending();
    this.renderRow('row-trending', items);
  },

  // Popular Movies Row
  async loadPopularMovies() {
    const items = await API.getPopularMovies(1);
    this.renderRow('row-popular-movies', items);
  },

  // Popular TV Row
  async loadPopularTV() {
    const items = await API.getPopularTV(1);
    this.renderRow('row-popular-tv', items);
  },

  // Top Rated Row
  async loadTopRated() {
    const items = await API.getTopRatedMovies(1);
    this.renderRow('row-top-rated', items);
  },

  // Anime & Animation Row
  async loadAnime() {
    const all = [...CURATED_CATALOG.movies, ...CURATED_CATALOG.tvShows];
    const anime = all.filter(item => 
      (item.genres && item.genres.includes('Animation')) ||
      [129, 372058, 1429, 94605, 569094].includes(item.id)
    );
    this.renderRow('row-anime', anime);
  },

  // Watchlist Row
  renderWatchlist() {
    const container = document.getElementById('row-watchlist');
    const section = document.getElementById('section-watchlist');
    if (!container || !section) return;

    const list = Storage.getWatchlist();
    if (list.length === 0) {
      if (this.currentFilter === 'watchlist') {
        section.classList.remove('hidden');
        container.innerHTML = '<p class="text-sm text-zinc-500 py-6">Your watchlist is currently empty. Click the "+ My List" button on any movie or TV show to save it here!</p>';
      } else {
        section.classList.add('hidden');
      }
      return;
    }

    section.classList.remove('hidden');
    this.renderRow('row-watchlist', list);
  },

  // Generic card row renderer
  renderRow(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !items) return;

    container.innerHTML = '';
    items.forEach(item => {
      const type = item.type || (item.name ? 'tv' : 'movie');
      const title = item.title || item.name;
      const card = document.createElement('div');
      card.className = 'group relative shrink-0 w-36 md:w-48 cursor-pointer select-none';

      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';

      const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : '7.8';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);

      card.innerHTML = `
        <div class="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-zinc-800 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-red-600/10">
          <img src="${posterUrl}" alt="${title}" class="h-full w-full object-cover" loading="lazy" />
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <span class="inline-block px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-bold uppercase tracking-wider text-zinc-300 w-fit mb-1 border border-zinc-700">
              ${type === 'tv' ? 'TV Show' : 'Movie'}
            </span>
            <h4 class="text-xs md:text-sm font-semibold text-white truncate">${title}</h4>
            <div class="flex items-center gap-2 text-[11px] text-zinc-300 mt-0.5">
              <span class="text-amber-400 font-bold">★ ${rating}</span>
              ${year ? `<span>• ${year}</span>` : ''}
            </div>
            
            <div class="mt-2 flex items-center gap-2">
              <button class="flex-1 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play
              </button>
              <button class="detail-btn p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs" title="Info">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Play click
      card.onclick = (e) => {
        if (e.target.closest('.detail-btn')) {
          e.stopPropagation();
          this.openDetails(type, item.id);
          return;
        }
        Player.open({
          id: item.id,
          type,
          title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path
        });
      };

      container.appendChild(card);
    });
  },

  // Carousel scroll helper
  scrollRow(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  },

  // Live Search
  async performSearch(query) {
    const resultsSection = document.getElementById('search-results-section');
    const resultsContainer = document.getElementById('search-results-grid');
    const searchCount = document.getElementById('search-results-count');

    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = '<div class="col-span-full py-8 text-center text-zinc-400">Searching content...</div>';

    const results = await API.search(query, 'multi');
    searchCount.textContent = `(${results.length} found)`;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="col-span-full py-12 text-center">
          <p class="text-zinc-400 mb-2">No matching titles found for "${query}"</p>
          <p class="text-xs text-zinc-500">Tip: You can add your free TMDB API key in Settings to search over 1,000,000+ movies & TV shows!</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = '';
    results.forEach(item => {
      const type = item.media_type || (item.name ? 'tv' : 'movie');
      const title = item.title || item.name;
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';

      const card = document.createElement('div');
      card.className = 'group relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-800 shadow-md cursor-pointer transition-transform hover:scale-105';
      card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
          <span class="inline-block px-1.5 py-0.5 rounded bg-black/60 text-[10px] uppercase font-bold text-zinc-300 w-fit mb-1 border border-zinc-700">
            ${type === 'tv' ? 'TV' : 'Movie'}
          </span>
          <h4 class="text-xs md:text-sm font-semibold text-white truncate">${title}</h4>
          <span class="text-[11px] text-amber-400">★ ${item.vote_average ? Number(item.vote_average).toFixed(1) : '7.5'}</span>
        </div>
      `;

      card.onclick = () => {
        Player.open({
          id: item.id,
          type,
          title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path
        });
      };

      resultsContainer.appendChild(card);
    });
  },

  // Open Details Modal with seasons/episodes and trailer
  async openDetails(type, id) {
    const modal = document.getElementById('details-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    const backdropEl = document.getElementById('details-backdrop');
    const posterEl = document.getElementById('details-poster');
    const titleEl = document.getElementById('details-title');
    const overviewEl = document.getElementById('details-overview');
    const ratingEl = document.getElementById('details-rating');
    const yearEl = document.getElementById('details-year');
    const genresEl = document.getElementById('details-genres');
    const playBtn = document.getElementById('details-play-btn');
    const watchlistBtn = document.getElementById('details-watchlist-btn');
    const tvSeasonsSection = document.getElementById('details-tv-seasons');
    const castContainer = document.getElementById('details-cast-container');

    // Fetch details
    const data = await API.getDetails(type, id);
    this.activeDetailItem = data;
    const title = data.title || data.name;

    if (titleEl) titleEl.textContent = title;
    if (overviewEl) overviewEl.textContent = data.overview || 'No synopsis available.';
    if (ratingEl) ratingEl.textContent = `★ ${data.vote_average ? Number(data.vote_average).toFixed(1) : '8.0'}`;
    if (yearEl) yearEl.textContent = (data.release_date || data.first_air_date || '').slice(0, 4);

    if (genresEl) {
      const genreNames = Array.isArray(data.genres) 
        ? data.genres.map(g => (typeof g === 'string' ? g : g.name)) 
        : ['Action', 'Drama'];
      genresEl.innerHTML = genreNames.map(g => `<span class="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-300 border border-zinc-700">${g}</span>`).join('');
    }

    if (posterEl) {
      posterEl.src = data.poster_path 
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';
    }

    if (backdropEl && data.backdrop_path) {
      backdropEl.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${data.backdrop_path})`;
    }

    // Play button
    if (playBtn) {
      playBtn.onclick = () => {
        this.closeDetails();
        Player.open({
          id: data.id,
          type,
          title,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          season: 1,
          episode: 1
        });
      };
    }

    // Watchlist button
    if (watchlistBtn) {
      const refreshWatchlistBtn = () => {
        const inList = Storage.isInWatchlist(data.id, type);
        watchlistBtn.innerHTML = inList
          ? `<svg class="w-4 h-4 fill-current text-red-500 mr-1" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg> Saved`
          : `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> + List`;
      };
      refreshWatchlistBtn();
      watchlistBtn.onclick = () => {
        Storage.toggleWatchlist({ ...data, type });
        refreshWatchlistBtn();
        this.renderWatchlist();
      };
    }

    // TV Seasons & Episodes
    if (tvSeasonsSection) {
      if (type === 'tv') {
        tvSeasonsSection.classList.remove('hidden');
        this.renderSeasonSelector(data);
      } else {
        tvSeasonsSection.classList.add('hidden');
      }
    }

    // Render Cast if available
    if (castContainer) {
      const cast = data.credits?.cast || [];
      if (cast.length > 0) {
        castContainer.innerHTML = cast.slice(0, 8).map(c => `
          <div class="shrink-0 w-20 text-center">
            <img src="${c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://via.placeholder.com/185x278?text=Actor'}" class="w-16 h-16 rounded-full object-cover mx-auto mb-1 border border-zinc-700" />
            <p class="text-[11px] font-medium text-white truncate">${c.name}</p>
            <p class="text-[10px] text-zinc-400 truncate">${c.character}</p>
          </div>
        `).join('');
      } else {
        castContainer.innerHTML = '<span class="text-xs text-zinc-500">Cast info loading or unavailable</span>';
      }
    }
  },

  async renderSeasonSelector(showData) {
    const seasonSelect = document.getElementById('details-season-select');
    const episodesGrid = document.getElementById('details-episodes-grid');
    if (!seasonSelect || !episodesGrid) return;

    const seasons = showData.seasons || [
      { season_number: 1, name: "Season 1", episode_count: 10 }
    ];

    seasonSelect.innerHTML = seasons.map(s => `
      <option value="${s.season_number}">${s.name || `Season ${s.season_number}`} (${s.episode_count || 10} eps)</option>
    `).join('');

    const loadEpisodes = async (seasonNum) => {
      episodesGrid.innerHTML = '<div class="col-span-full py-4 text-xs text-zinc-400">Loading episodes...</div>';
      const episodes = await API.getSeasonEpisodes(showData.id, seasonNum);
      episodesGrid.innerHTML = '';

      episodes.forEach(ep => {
        const item = document.createElement('div');
        item.className = 'group p-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 cursor-pointer transition-all flex items-center justify-between gap-3';
        item.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-7 h-7 rounded-full bg-red-600/20 text-red-400 font-bold text-xs flex items-center justify-center shrink-0 border border-red-500/30">
              ${ep.episode_number}
            </span>
            <div class="min-w-0">
              <h5 class="text-xs font-semibold text-white truncate">${ep.name || `Episode ${ep.episode_number}`}</h5>
              <p class="text-[11px] text-zinc-400 truncate">${ep.overview || 'Ready to stream on Vidstuck'}</p>
            </div>
          </div>
          <button class="shrink-0 p-1.5 rounded-full bg-red-600 text-white opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
            <svg class="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        `;

        item.onclick = () => {
          this.closeDetails();
          Player.open({
            id: showData.id,
            type: 'tv',
            title: showData.title || showData.name,
            poster_path: showData.poster_path,
            backdrop_path: showData.backdrop_path,
            season: seasonNum,
            episode: ep.episode_number
          });
        };

        episodesGrid.appendChild(item);
      });
    };

    seasonSelect.onchange = (e) => {
      loadEpisodes(e.target.value);
    };

    loadEpisodes(seasons[0]?.season_number || 1);
  },

  closeDetails() {
    const modal = document.getElementById('details-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    this.activeDetailItem = null;
  },

  // Filter tabs handler
  setFilter(tabName) {
    this.currentFilter = tabName;
    const sections = {
      hero: document.getElementById('section-hero'),
      continueWatching: document.getElementById('section-continue-watching'),
      trending: document.getElementById('section-trending'),
      movies: document.getElementById('section-popular-movies'),
      tv: document.getElementById('section-popular-tv'),
      topRated: document.getElementById('section-top-rated'),
      anime: document.getElementById('section-anime'),
      watchlist: document.getElementById('section-watchlist')
    };

    if (tabName === 'all') {
      Object.values(sections).forEach(sec => sec && sec.classList.remove('hidden'));
      this.renderContinueWatching();
      this.renderWatchlist();
    } else if (tabName === 'movies') {
      sections.hero?.classList.remove('hidden');
      sections.continueWatching?.classList.add('hidden');
      sections.trending?.classList.remove('hidden');
      sections.movies?.classList.remove('hidden');
      sections.tv?.classList.add('hidden');
      sections.topRated?.classList.remove('hidden');
      sections.anime?.classList.add('hidden');
      sections.watchlist?.classList.add('hidden');
    } else if (tabName === 'tv') {
      sections.hero?.classList.remove('hidden');
      sections.continueWatching?.classList.add('hidden');
      sections.trending?.classList.add('hidden');
      sections.movies?.classList.add('hidden');
      sections.tv?.classList.remove('hidden');
      sections.topRated?.classList.add('hidden');
      sections.anime?.classList.add('hidden');
      sections.watchlist?.classList.add('hidden');
    } else if (tabName === 'anime') {
      sections.hero?.classList.add('hidden');
      sections.continueWatching?.classList.add('hidden');
      sections.trending?.classList.add('hidden');
      sections.movies?.classList.add('hidden');
      sections.tv?.classList.add('hidden');
      sections.topRated?.classList.add('hidden');
      sections.anime?.classList.remove('hidden');
      sections.watchlist?.classList.add('hidden');
    } else if (tabName === 'watchlist') {
      sections.hero?.classList.add('hidden');
      sections.continueWatching?.classList.remove('hidden');
      sections.trending?.classList.add('hidden');
      sections.movies?.classList.add('hidden');
      sections.tv?.classList.add('hidden');
      sections.topRated?.classList.add('hidden');
      sections.anime?.classList.add('hidden');
      sections.watchlist?.classList.remove('hidden');
      this.renderWatchlist();
    }
  },

  // Settings Modal Handlers
  openSettings() {
    this.renderSettingsValues();
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
  },

  renderSettingsValues() {
    const settings = Storage.getSettings();
    const brandingInput = document.getElementById('setting-branding');
    const colorInput = document.getElementById('setting-player-color');
    const colorHex = document.getElementById('setting-color-hex');
    const subtitleSelect = document.getElementById('setting-subtitle');
    const serverSelect = document.getElementById('setting-server');
    const tmdbInput = document.getElementById('setting-tmdb-key');

    if (brandingInput) brandingInput.value = settings.branding || 'VIDSTUCK';
    if (colorInput) colorInput.value = `#${settings.playerColor || 'E50914'}`;
    if (colorHex) colorHex.textContent = `#${settings.playerColor || 'E50914'}`;
    if (subtitleSelect) subtitleSelect.value = settings.subtitle || 'english';
    if (serverSelect) serverSelect.value = settings.server || '';
    if (tmdbInput) tmdbInput.value = settings.tmdbApiKey || '';
  },

  saveSettingsFromForm() {
    const brandingInput = document.getElementById('setting-branding');
    const colorInput = document.getElementById('setting-player-color');
    const subtitleSelect = document.getElementById('setting-subtitle');
    const serverSelect = document.getElementById('setting-server');
    const tmdbInput = document.getElementById('setting-tmdb-key');

    Storage.saveSettings({
      branding: brandingInput ? brandingInput.value.trim() : 'VIDSTUCK',
      playerColor: colorInput ? colorInput.value.replace('#', '') : 'E50914',
      subtitle: subtitleSelect ? subtitleSelect.value : 'english',
      server: serverSelect ? serverSelect.value : '',
      tmdbApiKey: tmdbInput ? tmdbInput.value.trim() : ''
    });

    this.closeSettings();
    // Reload hero and trending with new key if changed
    this.loadTrending();
    this.loadPopularMovies();
  },

  clearAllData() {
    if (confirm('Are you sure you want to clear your watch history and watchlist?')) {
      Storage.clearWatchHistory();
      localStorage.removeItem(Storage.KEYS.WATCHLIST);
      this.renderContinueWatching();
      this.renderWatchlist();
      alert('Watch history and watchlist cleared.');
    }
  }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
