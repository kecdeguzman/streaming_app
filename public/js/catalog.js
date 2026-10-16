// Curated rich catalog of popular blockbuster movies & top TV series with real TMDB IDs
const CURATED_CATALOG = {
  movies: [
    {
      id: 299534,
      title: "Avengers: Endgame",
      type: "movie",
      overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
      poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      vote_average: 8.3,
      release_date: "2019-04-24",
      genres: ["Action", "Adventure", "Sci-Fi"],
      runtime: 181,
      tagline: "Part of the journey is the end."
    },
    {
      id: 693134,
      title: "Dune: Part Two",
      type: "movie",
      overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg",
      vote_average: 8.2,
      release_date: "2024-02-27",
      genres: ["Sci-Fi", "Adventure"],
      runtime: 166,
      tagline: "Long live the fighters."
    },
    {
      id: 533535,
      title: "Deadpool & Wolverine",
      type: "movie",
      overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
      poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      backdrop_path: "/yDHYTjA3R0jFYba16jBB1ef8oIt.jpg",
      vote_average: 7.7,
      release_date: "2024-07-24",
      genres: ["Action", "Comedy", "Sci-Fi"],
      runtime: 128,
      tagline: "Come together."
    },
    {
      id: 157336,
      title: "Interstellar",
      type: "movie",
      overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/rAiYTggZ7vrBtBhbhvtDTLiFiZ5.jpg",
      vote_average: 8.4,
      release_date: "2014-11-05",
      genres: ["Sci-Fi", "Drama", "Adventure"],
      runtime: 169,
      tagline: "Mankind was born on Earth. It was never meant to die here."
    },
    {
      id: 872585,
      title: "Oppenheimer",
      type: "movie",
      overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
      poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      vote_average: 8.1,
      release_date: "2023-07-19",
      genres: ["Drama", "History"],
      runtime: 180,
      tagline: "The world forever changes."
    },
    {
      id: 569094,
      title: "Spider-Man: Across the Spider-Verse",
      type: "movie",
      overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.",
      poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
      vote_average: 8.4,
      release_date: "2023-05-31",
      genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
      runtime: 140,
      tagline: "It's how you wear the mask that matters."
    },
    {
      id: 155,
      title: "The Dark Knight",
      type: "movie",
      overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
      vote_average: 8.5,
      release_date: "2008-07-16",
      genres: ["Drama", "Action", "Crime", "Thriller"],
      runtime: 152,
      tagline: "Welcome to a world without rules."
    },
    {
      id: 27205,
      title: "Inception",
      type: "movie",
      overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\".",
      poster_path: "/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
      backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
      vote_average: 8.4,
      release_date: "2010-07-15",
      genres: ["Action", "Sci-Fi", "Adventure"],
      runtime: 148,
      tagline: "Your mind is the scene of the crime."
    },
    {
      id: 945961,
      title: "Alien: Romulus",
      type: "movie",
      overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.",
      poster_path: "/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg",
      backdrop_path: "/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
      vote_average: 7.2,
      release_date: "2024-08-13",
      genres: ["Horror", "Sci-Fi"],
      runtime: 119,
      tagline: "In space, no one can hear you."
    },
    {
      id: 603692,
      title: "John Wick: Chapter 4",
      type: "movie",
      overview: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
      poster_path: "/vZloFAK7NKnMGKEslUsZ2VoNmQm.jpg",
      backdrop_path: "/7I6VUdPj6tQECNHdviJkUHD2389.jpg",
      vote_average: 7.8,
      release_date: "2023-03-22",
      genres: ["Action", "Thriller", "Crime"],
      runtime: 169,
      tagline: "No way back, one way out."
    },
    {
      id: 129,
      title: "Spirited Away",
      type: "movie",
      overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
      poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
      backdrop_path: "/bXNvzjYE9rvBA2L2POm0AZF7YBC.jpg",
      vote_average: 8.5,
      release_date: "2001-07-20",
      genres: ["Animation", "Family", "Fantasy"],
      runtime: 125,
      tagline: "The tunnel led Chihiro to a mysterious town..."
    },
    {
      id: 372058,
      title: "Your Name.",
      type: "movie",
      overview: "High schoolers Mitsuha and Taki are complete strangers living separate lives in different parts of Japan. But one night, they suddenly switch places in their sleep.",
      poster_path: "/q719jXXEzOoYaps6qFsRwa0qWcu.jpg",
      backdrop_path: "/dIWwZW7dJJ1qC6CUCV7dudTeWFu.jpg",
      vote_average: 8.5,
      release_date: "2016-08-26",
      genres: ["Animation", "Romance", "Drama"],
      runtime: 106,
      tagline: "Treasure the experience. Dreams fade away after you wake up."
    }
  ],

  tvShows: [
    {
      id: 1399,
      name: "Game of Thrones",
      title: "Game of Thrones",
      type: "tv",
      overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
      poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
      vote_average: 8.4,
      first_air_date: "2011-04-17",
      genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
      number_of_seasons: 8,
      seasons: [
        { season_number: 1, episode_count: 10, name: "Season 1" },
        { season_number: 2, episode_count: 10, name: "Season 2" },
        { season_number: 3, episode_count: 10, name: "Season 3" },
        { season_number: 4, episode_count: 10, name: "Season 4" },
        { season_number: 5, episode_count: 10, name: "Season 5" },
        { season_number: 6, episode_count: 10, name: "Season 6" },
        { season_number: 7, episode_count: 7, name: "Season 7" },
        { season_number: 8, episode_count: 6, name: "Season 8" }
      ]
    },
    {
      id: 1396,
      name: "Breaking Bad",
      title: "Breaking Bad",
      type: "tv",
      overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He decides to enter the dangerous world of drugs and crime.",
      poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      vote_average: 8.9,
      first_air_date: "2008-01-20",
      genres: ["Drama", "Crime"],
      number_of_seasons: 5,
      seasons: [
        { season_number: 1, episode_count: 7, name: "Season 1" },
        { season_number: 2, episode_count: 13, name: "Season 2" },
        { season_number: 3, episode_count: 13, name: "Season 3" },
        { season_number: 4, episode_count: 13, name: "Season 4" },
        { season_number: 5, episode_count: 16, name: "Season 5" }
      ]
    },
    {
      id: 94605,
      name: "Arcane",
      title: "Arcane",
      type: "tv",
      overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.",
      poster_path: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
      backdrop_path: "/2A4aYp2qFj71uO3N7o1yU6bO8.jpg",
      vote_average: 8.7,
      first_air_date: "2021-11-06",
      genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
      number_of_seasons: 2,
      seasons: [
        { season_number: 1, episode_count: 9, name: "Season 1" },
        { season_number: 2, episode_count: 9, name: "Season 2" }
      ]
    },
    {
      id: 66732,
      name: "Stranger Things",
      title: "Stranger Things",
      type: "tv",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      vote_average: 8.6,
      first_air_date: "2016-07-15",
      genres: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
      number_of_seasons: 4,
      seasons: [
        { season_number: 1, episode_count: 8, name: "Season 1" },
        { season_number: 2, episode_count: 9, name: "Season 2" },
        { season_number: 3, episode_count: 8, name: "Season 3" },
        { season_number: 4, episode_count: 9, name: "Season 4" }
      ]
    },
    {
      id: 100088,
      name: "The Last of Us",
      title: "The Last of Us",
      type: "tv",
      overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
      poster_path: "/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
      backdrop_path: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
      vote_average: 8.6,
      first_air_date: "2023-01-15",
      genres: ["Drama", "Action & Adventure", "Sci-Fi & Fantasy"],
      number_of_seasons: 1,
      seasons: [
        { season_number: 1, episode_count: 9, name: "Season 1" }
      ]
    },
    {
      id: 106379,
      name: "Fallout",
      title: "Fallout",
      type: "tv",
      overview: "The story of haves and have-nots in a world in which there’s almost nothing left to have. 200 years after the apocalypse, the gentle denizens of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.",
      poster_path: "/AnsiksoWFMt3AhVkjhAL3691IO1.jpg",
      backdrop_path: "/fZk29R3eR3zV4l3fQ5v0qV9x9eY.jpg",
      vote_average: 8.4,
      first_air_date: "2024-04-10",
      genres: ["Action & Adventure", "Sci-Fi & Fantasy", "Drama"],
      number_of_seasons: 1,
      seasons: [
        { season_number: 1, episode_count: 8, name: "Season 1" }
      ]
    },
    {
      id: 1429,
      name: "Attack on Titan",
      title: "Attack on Titan",
      type: "tv",
      overview: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
      poster_path: "/hTP1dtwGFamzeVWYfdmSZ9Sd5st.jpg",
      backdrop_path: "/2rmK7mnchw9Xr3XdiTFSxTT0Yqi.jpg",
      vote_average: 8.7,
      first_air_date: "2013-04-07",
      genres: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure"],
      number_of_seasons: 4,
      seasons: [
        { season_number: 1, episode_count: 25, name: "Season 1" },
        { season_number: 2, episode_count: 12, name: "Season 2" },
        { season_number: 3, episode_count: 22, name: "Season 3" },
        { season_number: 4, episode_count: 30, name: "The Final Season" }
      ]
    },
    {
      id: 95557,
      name: "Severance",
      title: "Severance",
      type: "tv",
      overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
      poster_path: "/1ZDOcsB0vHw91H3z4sR5T0H3hU4.jpg",
      backdrop_path: "/9iRRfMZ4hJjK6yR50V60v2P9Z7.jpg",
      vote_average: 8.4,
      first_air_date: "2022-02-17",
      genres: ["Drama", "Mystery", "Sci-Fi & Fantasy"],
      number_of_seasons: 2,
      seasons: [
        { season_number: 1, episode_count: 9, name: "Season 1" },
        { season_number: 2, episode_count: 10, name: "Season 2" }
      ]
    }
  ]
};

// Generates placeholder episode metadata if live season data from TMDB is not available
function generateMockEpisodes(showId, seasonNumber, count = 10) {
  const episodes = [];
  for (let i = 1; i <= count; i++) {
    episodes.push({
      id: `${showId}-${seasonNumber}-${i}`,
      episode_number: i,
      season_number: seasonNumber,
      name: `Episode ${i}`,
      overview: `Episode ${i} of Season ${seasonNumber}. Click to stream now via Vidstuck.`,
      air_date: `Season ${seasonNumber}`
    });
  }
  return episodes;
}
