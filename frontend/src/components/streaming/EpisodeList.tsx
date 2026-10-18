import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  List,
  LayoutGrid,
  Search,
  CheckCircle2,
  Circle,
  Play,
  Clock,
} from 'lucide-react';
import { Episode } from '../../types';
import { useLibraryStore } from '../../store/libraryStore';

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  activeEpisodeNumber: number;
  onSelectEpisode: (episodeNumber: number) => void;
  isLoading?: boolean;
  totalEpisodesCount?: number;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  animeId,
  episodes,
  activeEpisodeNumber,
  onSelectEpisode,
  isLoading = false,
  totalEpisodesCount,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  const { isEpisodeWatched, markEpisodeWatched, unmarkEpisodeWatched } = useLibraryStore();

  const activeEpisodeRef = useRef<HTMLButtonElement | null>(null);

  // If episodes array is empty but we know totalEpisodesCount or have at least 1, synthesize dummy episodes
  const effectiveEpisodes = useMemo(() => {
    if (episodes && episodes.length > 0) {
      return episodes;
    }
    const count = totalEpisodesCount && totalEpisodesCount > 0 ? totalEpisodesCount : 12;
    return Array.from({ length: count }, (_, i) => {
      const epNum = i + 1;
      return {
        mal_id: epNum,
        number: epNum,
        url: '',
        images: { jpg: { image_url: '' } },
        aired: 'Recent',
        duration: 24,
        filler: false,
        recap: false,
        forum_url: '',
        synopsis: `Episode ${epNum}`,
        title: `Episode ${epNum}`,
        title_romanji: `Episode ${epNum}`,
        title_japanese: `第${epNum}話`,
      } as Episode;
    });
  }, [episodes, totalEpisodesCount]);

  // Group into ranges of 25 episodes (e.g. 1-25, 26-50, etc.)
  const RANGE_SIZE = 25;
  const ranges = useMemo(() => {
    const list: { start: number; end: number; label: string }[] = [];
    const total = effectiveEpisodes.length;
    if (total <= RANGE_SIZE) {
      return [{ start: 1, end: total, label: `1 - ${total}` }];
    }
    for (let i = 0; i < total; i += RANGE_SIZE) {
      const start = i + 1;
      const end = Math.min(i + RANGE_SIZE, total);
      list.push({ start, end, label: `${start} - ${end}` });
    }
    return list;
  }, [effectiveEpisodes.length]);

  // Auto-switch range tab to match active episode if out of bounds
  useEffect(() => {
    if (ranges.length > 1) {
      const targetIndex = ranges.findIndex(
        (r) => activeEpisodeNumber >= r.start && activeEpisodeNumber <= r.end
      );
      if (targetIndex !== -1 && targetIndex !== selectedRangeIndex) {
        setSelectedRangeIndex(targetIndex);
      }
    }
  }, [activeEpisodeNumber, ranges]);

  // Scroll active item into view
  useEffect(() => {
    if (activeEpisodeRef.current) {
      activeEpisodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeEpisodeNumber, selectedRangeIndex, viewMode]);

  // Calculate watched stats
  const watchedCount = useMemo(() => {
    return effectiveEpisodes.filter((ep) => isEpisodeWatched(animeId, ep.number)).length;
  }, [effectiveEpisodes, animeId, isEpisodeWatched]);

  const watchedPercentage = effectiveEpisodes.length
    ? Math.round((watchedCount / effectiveEpisodes.length) * 100)
    : 0;

  // Filter episodes
  const filteredEpisodes = useMemo(() => {
    let result = effectiveEpisodes;

    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ep) =>
          ep.number.toString() === query ||
          ep.title?.toLowerCase().includes(query) ||
          ep.title_romanji?.toLowerCase().includes(query)
      );
    } else if (ranges.length > 1 && ranges[selectedRangeIndex]) {
      // Filter by range if no search query
      const currentRange = ranges[selectedRangeIndex];
      result = result.filter(
        (ep) => ep.number >= currentRange.start && ep.number <= currentRange.end
      );
    }

    // Filter by watched status
    if (filterMode === 'watched') {
      result = result.filter((ep) => isEpisodeWatched(animeId, ep.number));
    } else if (filterMode === 'unwatched') {
      result = result.filter((ep) => !isEpisodeWatched(animeId, ep.number));
    }

    return result;
  }, [effectiveEpisodes, searchQuery, ranges, selectedRangeIndex, filterMode, animeId, isEpisodeWatched]);

  const toggleWatched = (e: React.MouseEvent, episodeNumber: number) => {
    e.stopPropagation();
    if (isEpisodeWatched(animeId, episodeNumber)) {
      unmarkEpisodeWatched(animeId, episodeNumber);
    } else {
      markEpisodeWatched(animeId, episodeNumber);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col h-full max-h-[720px]">
      {/* Header and Progress */}
      <div className="pb-3 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-white text-lg flex items-center gap-2">
              <span>Episodes</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                {effectiveEpisodes.length}
              </span>
            </h3>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-red-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Detailed List View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-red-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Watched Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Progress: {watchedCount} / {effectiveEpisodes.length} watched</span>
            <span className="text-red-400 font-semibold">{watchedPercentage}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${watchedPercentage}%` }}
            />
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search episode # or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded-lg transition ${
                filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('unwatched')}
              className={`px-2 py-1 rounded-lg transition ${
                filterMode === 'unwatched' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unwatched
            </button>
            <button
              onClick={() => setFilterMode('watched')}
              className={`px-2 py-1 rounded-lg transition ${
                filterMode === 'watched' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Watched
            </button>
          </div>
        </div>

        {/* Ranges selector (for series with > 25 episodes) */}
        {!searchQuery && ranges.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {ranges.map((range, index) => (
              <button
                key={range.label}
                onClick={() => setSelectedRangeIndex(index)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedRangeIndex === index
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episodes Container */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            <p className="text-xs">Loading episode catalog...</p>
          </div>
        ) : filteredEpisodes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
            No episodes found matching filter.
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5 gap-2">
            {filteredEpisodes.map((ep) => {
              const isActive = ep.number === activeEpisodeNumber;
              const isWatched = isEpisodeWatched(animeId, ep.number);

              return (
                <button
                  key={ep.number}
                  ref={isActive ? activeEpisodeRef : null}
                  onClick={() => onSelectEpisode(ep.number)}
                  title={`${ep.title || `Episode ${ep.number}`}${isWatched ? ' (Watched)' : ''}`}
                  className={`relative group aspect-square rounded-xl font-heading font-bold text-sm flex flex-col items-center justify-center transition-all duration-200 border ${
                    isActive
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40 ring-2 ring-red-400 scale-[1.03]'
                      : isWatched
                      ? 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      : 'bg-slate-950 text-slate-200 border-slate-800/90 hover:border-red-500/50 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {/* Watched Indicator Dot / Icon */}
                  {isWatched && !isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}

                  {/* Playing Wave Icon */}
                  {isActive ? (
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : null}

                  <span>{ep.number}</span>

                  {ep.filler && (
                    <span className="text-[9px] font-normal text-amber-400/90 leading-none mt-0.5">
                      Filler
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Detailed List View */
          <div className="space-y-2">
            {filteredEpisodes.map((ep) => {
              const isActive = ep.number === activeEpisodeNumber;
              const isWatched = isEpisodeWatched(animeId, ep.number);
              const thumbnail = ep.thumbnail || ep.images?.jpg?.image_url;

              return (
                <button
                  key={ep.number}
                  ref={isActive ? activeEpisodeRef : null}
                  onClick={() => onSelectEpisode(ep.number)}
                  className={`w-full text-left rounded-xl p-2.5 border transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-900 border-red-500/80 shadow-md ring-1 ring-red-500/40'
                      : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Thumbnail / Number badge */}
                  <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={ep.title || `Episode ${ep.number}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-xs font-bold text-slate-500 font-heading">EP {ep.number}</div>
                    )}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-heading px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        EP {ep.number}
                      </span>
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {ep.title || `Episode ${ep.number}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      {ep.aired && <span>{ep.aired}</span>}
                      {ep.duration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {ep.duration}m
                        </span>
                      ) : null}
                      {ep.filler && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                          Filler
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mark Watched Button */}
                  <div
                    onClick={(e) => toggleWatched(e, ep.number)}
                    title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 transition"
                  >
                    {isWatched ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="h-4 w-4 hover:text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
