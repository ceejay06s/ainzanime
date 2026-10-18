import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useAnimeDetails,
  useAnimeEpisodes,
  useStreamingServers,
  useTrendingAnime
} from '../hooks/useAnime';
import { StreamingPlayer } from '../components/streaming/StreamingPlayer';
import { ServerSelector } from '../components/streaming/ServerSelector';
import { EpisodeList } from '../components/streaming/EpisodeList';
import { AnimeGrid } from '../components/AnimeGrid';
import { useLibraryStore } from '../store/libraryStore';
import {
  StreamingServer,
  Episode,
} from '../types';
import {
  ChevronRight,
  Star,
  Heart,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';

export const WatchPage: React.FC = () => {
  const { id, episode: epParam } = useParams<{ id: string; episode?: string }>();
  const navigate = useNavigate();

  const animeId = parseInt(id || '1', 10);
  const initialEpisode = parseInt(epParam || '1', 10) || 1;

  const [activeEpisodeNumber, setActiveEpisodeNumber] = useState<number>(initialEpisode);
  const [selectedServer, setSelectedServer] = useState<StreamingServer | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Queries
  const { data: anime, isLoading: isAnimeLoading } = useAnimeDetails(animeId);
  const { data: episodesData, isLoading: isEpisodesLoading } = useAnimeEpisodes(animeId);
  const { data: serversData, isLoading: isServersLoading, refetch: refetchServers } =
    useStreamingServers(animeId, activeEpisodeNumber);
  const { data: trendingData } = useTrendingAnime(1);

  // Store
  const {
    isFavoriteAnime,
    addAnimeToFavorites,
    removeAnimeFromFavorites,
    isInWatchlist,
    addAnimeToWatchlist,
    removeAnimeFromWatchlist,
    markEpisodeWatched
  } = useLibraryStore();

  const episodes: Episode[] = episodesData?.data || [];
  const totalEpisodesCount =
    episodesData?.anime?.totalEpisodes || anime?.episodes || episodes.length || 12;

  // Sync state if URL param changes
  useEffect(() => {
    if (epParam) {
      const parsed = parseInt(epParam, 10);
      if (!isNaN(parsed) && parsed !== activeEpisodeNumber) {
        setActiveEpisodeNumber(parsed);
      }
    }
  }, [epParam]);

  // Mark episode watched and set default server when servers change
  useEffect(() => {
    if (serversData?.servers && serversData.servers.length > 0) {
      // Find server matching default or keep current if valid
      const found = serversData.servers.find((s) => s.id === selectedServer?.id);
      if (!found) {
        const defaultOne =
          serversData.servers.find((s) => s.id === serversData.defaultServer) ||
          serversData.servers[0];
        setSelectedServer(defaultOne);
      }
    }
  }, [serversData]);

  // Automatically record watch history
  useEffect(() => {
    if (animeId && activeEpisodeNumber) {
      markEpisodeWatched(animeId, activeEpisodeNumber);
    }
  }, [animeId, activeEpisodeNumber, markEpisodeWatched]);

  // Find active episode object
  const currentEpisode = useMemo(() => {
    if (!episodes.length) {
      return {
        mal_id: activeEpisodeNumber,
        number: activeEpisodeNumber,
        url: '',
        images: { jpg: { image_url: anime?.images?.jpg?.large_image_url || '' } },
        aired: 'Recent',
        duration: 24,
        filler: false,
        recap: false,
        forum_url: '',
        synopsis: `Episode ${activeEpisodeNumber}`,
        title: `Episode ${activeEpisodeNumber}`,
        title_romanji: `Episode ${activeEpisodeNumber}`,
        title_japanese: `第${activeEpisodeNumber}話`,
      } as Episode;
    }
    return (
      episodes.find((ep) => ep.number === activeEpisodeNumber) ||
      episodes[0] ||
      null
    );
  }, [episodes, activeEpisodeNumber, anime]);

  const hasPreviousEpisode = activeEpisodeNumber > 1;
  const hasNextEpisode = activeEpisodeNumber < totalEpisodesCount;

  const handleSelectEpisode = (epNum: number) => {
    setActiveEpisodeNumber(epNum);
    navigate(`/watch/${animeId}/${epNum}`, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousEpisode = () => {
    if (hasPreviousEpisode) {
      handleSelectEpisode(activeEpisodeNumber - 1);
    }
  };

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      handleSelectEpisode(activeEpisodeNumber + 1);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        handleNextEpisode();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePreviousEpisode();
      } else if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPreviousEpisode, hasNextEpisode, activeEpisodeNumber]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isFavorited = anime ? isFavoriteAnime(anime.mal_id) : false;
  const inWatchlist = anime ? isInWatchlist(anime.mal_id) : false;

  const toggleFavorite = () => {
    if (!anime) return;
    if (isFavorited) {
      removeAnimeFromFavorites(anime.mal_id);
    } else {
      addAnimeToFavorites(anime);
    }
  };

  const toggleWatchlist = () => {
    if (!anime) return;
    if (inWatchlist) {
      removeAnimeFromWatchlist(anime.mal_id);
    } else {
      addAnimeToWatchlist(anime);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Breadcrumb & Quick Nav */}
      <div className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
            <Link to="/anime" className="hover:text-white transition">Anime</Link>
            <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
            <span className="text-slate-200 truncate font-medium">
              {anime?.title || 'Streaming'}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
            <span className="text-red-500 font-bold flex-shrink-0">
              Episode {activeEpisodeNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Copy stream link to clipboard"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Streaming Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Cinema Stage Grid */}
        <div
          className={`grid gap-6 ${
            isTheaterMode
              ? 'grid-cols-1'
              : 'grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* Main Video & Server Column */}
          <div className={isTheaterMode ? 'col-span-1 space-y-6' : 'lg:col-span-8 space-y-6'}>
            {/* Streaming Player */}
            <StreamingPlayer
              animeTitle={anime?.title || 'Anime Stream'}
              episode={currentEpisode}
              server={selectedServer}
              hasPreviousEpisode={hasPreviousEpisode}
              hasNextEpisode={hasNextEpisode}
              onPreviousEpisode={handlePreviousEpisode}
              onNextEpisode={handleNextEpisode}
              isLoading={isAnimeLoading || isServersLoading}
              autoPlayNext={autoPlayNext}
              onToggleAutoPlayNext={() => setAutoPlayNext(!autoPlayNext)}
              isTheaterMode={isTheaterMode}
              onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
            />

            {/* Server Selector */}
            <ServerSelector
              servers={serversData?.servers || []}
              selectedServerId={selectedServer?.id || ''}
              onSelectServer={(server) => setSelectedServer(server)}
              isLoading={isServersLoading}
              onReload={() => refetchServers()}
            />

            {/* Anime Metadata & Action Card */}
            {anime && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img
                    src={anime.images?.jpg?.large_image_url}
                    alt={anime.title}
                    className="w-28 sm:w-36 rounded-xl object-cover shadow-lg border border-slate-800 flex-shrink-0"
                  />

                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
                          {anime.title}
                        </h1>
                        {anime.title_english && anime.title_english !== anime.title && (
                          <p className="text-xs text-slate-400 mt-0.5">{anime.title_english}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleFavorite}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            isFavorited
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-white' : ''}`} />
                          <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                        </button>

                        <button
                          onClick={toggleWatchlist}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            inWatchlist
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${inWatchlist ? 'fill-white' : ''}`} />
                          <span>{inWatchlist ? 'In Watchlist' : 'Add to List'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {anime.score ? (
                        <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {anime.score.toFixed(1)}
                        </span>
                      ) : null}

                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                        {anime.type || 'TV Series'}
                      </span>

                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                        {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}
                      </span>

                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                        {anime.status || 'Airing'}
                      </span>
                    </div>

                    {/* Genres */}
                    {anime.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {anime.genres.map((g) => (
                          <span
                            key={g.mal_id}
                            className="text-[11px] bg-red-600/15 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-md font-medium"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Synopsis */}
                    {anime.synopsis && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 pt-1">
                        {anime.synopsis}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Episode List Sidebar Column */}
          <div className={isTheaterMode ? 'col-span-1' : 'lg:col-span-4'}>
            <EpisodeList
              animeId={animeId}
              episodes={episodes}
              activeEpisodeNumber={activeEpisodeNumber}
              onSelectEpisode={handleSelectEpisode}
              isLoading={isEpisodesLoading}
              totalEpisodesCount={totalEpisodesCount}
            />
          </div>
        </div>

        {/* Recommended / Trending Row */}
        {trendingData?.data && trendingData.data.length > 0 && (
          <div className="pt-8 border-t border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                  <span>✨ More Anime to Stream</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Top trending recommendations</p>
              </div>
              <Link
                to="/trending"
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
              >
                Explore Catalog →
              </Link>
            </div>

            <AnimeGrid
              anime={trendingData.data.slice(0, 6)}
              onAnimeClick={(selectedId) => {
                navigate(`/watch/${selectedId}/1`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
