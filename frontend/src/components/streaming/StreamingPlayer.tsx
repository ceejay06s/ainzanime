import React, { useState, useEffect } from 'react';
import {
  Play,
  SkipBack,
  SkipForward,
  ExternalLink,
  Tv,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { StreamingServer, Episode } from '../../types';

interface StreamingPlayerProps {
  animeTitle: string;
  episode: Episode | null;
  server: StreamingServer | null;
  hasPreviousEpisode: boolean;
  hasNextEpisode: boolean;
  onPreviousEpisode: () => void;
  onNextEpisode: () => void;
  isLoading?: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
}

export const StreamingPlayer: React.FC<StreamingPlayerProps> = ({
  animeTitle,
  episode,
  server,
  hasPreviousEpisode,
  hasNextEpisode,
  onPreviousEpisode,
  onNextEpisode,
  isLoading = false,
  autoPlayNext = true,
  onToggleAutoPlayNext,
  isTheaterMode = false,
  onToggleTheaterMode,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Compute the stream / embed URL
  const streamUrl = React.useMemo(() => {
    if (server?.embedUrl) return server.embedUrl;
    if (server?.url) return server.url;
    if (server?.id === 'miruro' && episode) {
      return `https://www.miruro.tv/search?q=${encodeURIComponent(animeTitle)}&ep=${episode.number}`;
    }
    if (episode?.streamUrl) return episode.streamUrl;
    if (episode?.url) return episode.url;
    return `https://www.miruro.tv/search?q=${encodeURIComponent(animeTitle)}`;
  }, [server, episode, animeTitle]);

  const isEmbeddable = React.useMemo(() => {
    if (!server) return true;
    return server.isEmbeddable !== false;
  }, [server]);

  // Reset iframe state when episode or server changes
  useEffect(() => {
    setIframeLoaded(false);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  }, [episode?.number, server?.id]);

  const handleReload = () => {
    setIframeLoaded(false);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl transition-all">
      {/* Top Cinema Player Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex-shrink-0">
            <Tv className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading font-bold text-white text-sm sm:text-base truncate">
              {animeTitle}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {episode ? (
                <>
                  <span className="text-red-400 font-semibold">EP {episode.number}:</span>{' '}
                  {episode.title || `Episode ${episode.number}`}
                </>
              ) : (
                'Loading episode...'
              )}
            </p>
          </div>
        </div>

        {/* Server & Audio status pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {server && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-300">{server.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  server.type === 'dub'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {server.type}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded text-slate-400 bg-slate-800/80">
                {isEmbeddable ? 'In-App' : 'Direct'}
              </span>
            </div>
          )}

          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open streaming player in external tab"
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            <span>External Stream</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Video Viewport Container with 16:9 Aspect Ratio */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Ambient backlight glow */}
        <div className="absolute inset-0 bg-red-600/5 blur-3xl pointer-events-none" />

        {/* If server is direct-only (like Miruro which sets X-Frame-Options: SAMEORIGIN) */}
        {!isEmbeddable ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950">
            <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 mb-3 shadow-lg shadow-red-950/40">
              <Tv className="h-10 w-10 text-red-500" />
            </div>
            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">{server?.name || 'Direct Stream'}</span>
                <span>•</span>
                <span className="uppercase text-red-400 font-bold">{server?.type || 'SUB'}</span>
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                {animeTitle}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This stream is configured for direct high-speed playback on {server?.name || 'Miruro'}.
                Click below to launch Episode {episode?.number || 1} in a clean player tab:
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-sm shadow-xl shadow-red-900/50 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Stream Episode {episode?.number || 1} on {server?.name || 'Miruro'}</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-80" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              💡 Prefer in-app viewing? Switch server to <strong>VidSrc HD</strong> or <strong>2Embed Multi</strong> below.
            </p>
          </div>
        ) : (
          <>
            {/* Loading Spinner for Embed */}
            {(isLoading || (!iframeLoaded && !hasError)) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-4 w-4 fill-red-500 text-red-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    Loading {server?.name || 'Player'}
                  </p>
                  <p className="text-xs text-slate-400">Connecting to stream sources...</p>
                </div>
              </div>
            )}

            {/* Embedded Iframe Player */}
            <iframe
              key={iframeKey}
              src={streamUrl}
              title={animeTitle}
              className="w-full h-full border-0 z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
              onError={() => setHasError(true)}
            />

            {/* Fallback Banner for restricted embeds */}
            {hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 text-center gap-4">
                <AlertCircle className="h-12 w-12 text-amber-400" />
                <div className="max-w-md">
                  <h3 className="font-heading font-bold text-lg text-white">
                    Player Restricted or Blocked
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Some third-party video providers prevent embedding inside frames. You can
                    launch the video directly in a clean external tab or switch servers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-900/40 transition flex items-center gap-2"
                  >
                    <span>Play in External Tab</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={handleReload}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm border border-slate-700 transition flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Retry Connection</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Cinema Controls Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Previous / Next Episode Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousEpisode}
            disabled={!hasPreviousEpisode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed font-medium"
          >
            <SkipBack className="h-3.5 w-3.5" />
            <span>Prev Ep</span>
          </button>

          <button
            onClick={onNextEpisode}
            disabled={!hasNextEpisode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-900/30 transition disabled:opacity-40 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
          >
            <span>Next Ep</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Player Options & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onToggleAutoPlayNext && (
            <button
              onClick={onToggleAutoPlayNext}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${
                autoPlayNext
                  ? 'bg-slate-800 text-red-400 border-red-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoPlayNext ? 'bg-red-500' : 'bg-slate-600'}`} />
              <span>Autoplay Next: {autoPlayNext ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {onToggleTheaterMode && (
            <button
              onClick={onToggleTheaterMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition ${
                isTheaterMode
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Theater Mode</span>
            </button>
          )}

          <button
            onClick={handleReload}
            title="Reload video player"
            className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
