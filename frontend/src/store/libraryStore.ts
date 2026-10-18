import { create } from 'zustand';
import { Anime, Manga } from '../types';

interface LibraryStore {
  favoriteAnime: Anime[];
  favoriteManga: Manga[];
  watchlist: Anime[];
  readingList: Manga[];
  watchedEpisodes: Record<number, number[]>;
  lastWatchedEpisode: Record<number, number>;
  addAnimeToFavorites: (anime: Anime) => void;
  removeAnimeFromFavorites: (id: number) => void;
  addMangaToFavorites: (manga: Manga) => void;
  removeMangaFromFavorites: (id: string) => void;
  addAnimeToWatchlist: (anime: Anime) => void;
  removeAnimeFromWatchlist: (id: number) => void;
  addMangaToReadingList: (manga: Manga) => void;
  removeMangaFromReadingList: (id: string) => void;
  isFavoriteAnime: (id: number) => boolean;
  isFavoriteManga: (id: string) => boolean;
  isInWatchlist: (id: number) => boolean;
  isInReadingList: (id: string) => boolean;
  markEpisodeWatched: (animeId: number, episodeNumber: number) => void;
  unmarkEpisodeWatched: (animeId: number, episodeNumber: number) => void;
  isEpisodeWatched: (animeId: number, episodeNumber: number) => boolean;
  getLastWatchedEpisode: (animeId: number) => number | undefined;
}

const getStoredWatchedEpisodes = (): Record<number, number[]> => {
  try {
    const data = localStorage.getItem('ainzanime_watched_episodes');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const getStoredLastWatched = (): Record<number, number> => {
  try {
    const data = localStorage.getItem('ainzanime_last_watched');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  favoriteAnime: [],
  favoriteManga: [],
  watchlist: [],
  readingList: [],
  watchedEpisodes: getStoredWatchedEpisodes(),
  lastWatchedEpisode: getStoredLastWatched(),

  addAnimeToFavorites: (anime: Anime) =>
    set((state) => {
      if (state.favoriteAnime.some((a) => a.mal_id === anime.mal_id)) {
        return state;
      }
      return { favoriteAnime: [...state.favoriteAnime, anime] };
    }),

  removeAnimeFromFavorites: (id: number) =>
    set((state) => ({
      favoriteAnime: state.favoriteAnime.filter((a) => a.mal_id !== id),
    })),

  addMangaToFavorites: (manga: Manga) =>
    set((state) => {
      if (state.favoriteManga.some((m) => m.id === manga.id)) {
        return state;
      }
      return { favoriteManga: [...state.favoriteManga, manga] };
    }),

  removeMangaFromFavorites: (id: string) =>
    set((state) => ({
      favoriteManga: state.favoriteManga.filter((m) => m.id !== id),
    })),

  addAnimeToWatchlist: (anime: Anime) =>
    set((state) => {
      if (state.watchlist.some((a) => a.mal_id === anime.mal_id)) {
        return state;
      }
      return { watchlist: [...state.watchlist, anime] };
    }),

  removeAnimeFromWatchlist: (id: number) =>
    set((state) => ({
      watchlist: state.watchlist.filter((a) => a.mal_id !== id),
    })),

  addMangaToReadingList: (manga: Manga) =>
    set((state) => {
      if (state.readingList.some((m) => m.id === manga.id)) {
        return state;
      }
      return { readingList: [...state.readingList, manga] };
    }),

  removeMangaFromReadingList: (id: string) =>
    set((state) => ({
      readingList: state.readingList.filter((m) => m.id !== id),
    })),

  isFavoriteAnime: (id: number) =>
    get().favoriteAnime.some((a) => a.mal_id === id),

  isFavoriteManga: (id: string) =>
    get().favoriteManga.some((m) => m.id === id),

  isInWatchlist: (id: number) =>
    get().watchlist.some((a) => a.mal_id === id),

  isInReadingList: (id: string) =>
    get().readingList.some((m) => m.id === id),

  markEpisodeWatched: (animeId: number, episodeNumber: number) => {
    set((state) => {
      const currentList = state.watchedEpisodes[animeId] || [];
      const updatedList = currentList.includes(episodeNumber)
        ? currentList
        : [...currentList, episodeNumber];
      const newWatched = { ...state.watchedEpisodes, [animeId]: updatedList };
      const newLastWatched = { ...state.lastWatchedEpisode, [animeId]: episodeNumber };

      try {
        localStorage.setItem('ainzanime_watched_episodes', JSON.stringify(newWatched));
        localStorage.setItem('ainzanime_last_watched', JSON.stringify(newLastWatched));
      } catch {
        // ignore storage errors
      }

      return {
        watchedEpisodes: newWatched,
        lastWatchedEpisode: newLastWatched,
      };
    });
  },

  unmarkEpisodeWatched: (animeId: number, episodeNumber: number) => {
    set((state) => {
      const currentList = state.watchedEpisodes[animeId] || [];
      const updatedList = currentList.filter((ep) => ep !== episodeNumber);
      const newWatched = { ...state.watchedEpisodes, [animeId]: updatedList };

      try {
        localStorage.setItem('ainzanime_watched_episodes', JSON.stringify(newWatched));
      } catch {
        // ignore
      }

      return { watchedEpisodes: newWatched };
    });
  },

  isEpisodeWatched: (animeId: number, episodeNumber: number) => {
    const list = get().watchedEpisodes[animeId];
    return list ? list.includes(episodeNumber) : false;
  },

  getLastWatchedEpisode: (animeId: number) => {
    return get().lastWatchedEpisode[animeId];
  },
}));
