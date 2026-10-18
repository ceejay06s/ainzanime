import React, { useState } from 'react';
import { Server, Wifi, Volume2, ShieldCheck, RefreshCw } from 'lucide-react';
import { StreamingServer } from '../../types';

interface ServerSelectorProps {
  servers: StreamingServer[];
  selectedServerId: string;
  onSelectServer: (server: StreamingServer) => void;
  isLoading?: boolean;
  onReload?: () => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  servers,
  selectedServerId,
  onSelectServer,
  isLoading = false,
  onReload,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sub' | 'dub'>('all');

  // Fallback default servers if backend returns empty
  const defaultServers: StreamingServer[] = [
    {
      id: 'vidsrc-embed',
      name: 'VidSrc HD',
      label: 'In-App Player (1080p)',
      type: 'sub',
      quality: '1080p',
      isEmbeddable: true,
      url: '',
      active: true,
    },
    {
      id: '2embed',
      name: '2Embed Multi',
      label: 'In-App Player (Multi-Host)',
      type: 'sub',
      quality: '1080p',
      isEmbeddable: true,
      url: '',
      active: true,
    },
    {
      id: 'icarus-sub',
      name: 'Miruro Sun',
      label: 'Direct Stream (Icarus)',
      type: 'sub',
      quality: '1080p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
    {
      id: 'icarus-dub',
      name: 'Miruro Sun (Dub)',
      label: 'Direct Stream (Icarus Dub)',
      type: 'dub',
      quality: '1080p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
    {
      id: 'anikoto-sub',
      name: 'Miruro Bee',
      label: 'Direct Stream (Anikoto)',
      type: 'sub',
      quality: '1080p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
    {
      id: 'anikoto-dub',
      name: 'Miruro Bee (Dub)',
      label: 'Direct Stream (Anikoto Dub)',
      type: 'dub',
      quality: '1080p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
    {
      id: 'animepahe-sub',
      name: 'AnimePahe',
      label: 'Backup Stream (Sub)',
      type: 'sub',
      quality: '1080p / 720p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
    {
      id: 'animepahe-dub',
      name: 'AnimePahe (Dub)',
      label: 'Backup Stream (Dub)',
      type: 'dub',
      quality: '1080p / 720p',
      isEmbeddable: false,
      url: '',
      active: true,
    },
  ];

  const availableServers = servers && servers.length > 0 ? servers : defaultServers;

  const subCount = availableServers.filter((s) => s.type === 'sub').length;
  const dubCount = availableServers.filter((s) => s.type === 'dub').length;

  const filteredServers = availableServers.filter((s) => {
    if (activeTab === 'sub') return s.type === 'sub';
    if (activeTab === 'dub') return s.type === 'dub';
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Header & Sub/Dub Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/15 border border-red-500/20 text-red-500">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base">Streaming Servers</h3>
            <p className="text-xs text-slate-400">Switch server if playback is slow or interrupted</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({availableServers.length})
            </button>
            <button
              onClick={() => setActiveTab('sub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'sub'
                  ? 'bg-red-600 text-white font-semibold shadow-sm shadow-red-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Volume2 className="h-3 w-3" />
              Sub ({subCount})
            </button>
            {dubCount > 0 && (
              <button
                onClick={() => setActiveTab('dub')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'dub'
                    ? 'bg-red-600 text-white font-semibold shadow-sm shadow-red-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Volume2 className="h-3 w-3" />
                Dub ({dubCount})
              </button>
            )}
          </div>

          {onReload && (
            <button
              onClick={onReload}
              disabled={isLoading}
              title="Reload server connection"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredServers.map((server) => {
          const isSelected = selectedServerId === server.id;
          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(server)}
              className={`group relative text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-900 border-red-500/80 shadow-md shadow-red-950/30 ring-1 ring-red-500/50'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-red-500 ring-4 ring-red-500/20 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm truncate transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {server.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        server.type === 'dub'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {server.type}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                        server.isEmbeddable !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {server.isEmbeddable !== false ? 'In-App' : 'Direct'}
                    </span>
                    {server.id.includes('animepahe') && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                        Backup
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {server.label || (server.quality ? `${server.quality} HD` : 'Standard Fast')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50 flex items-center gap-1">
                  <Wifi className="h-2.5 w-2.5 text-emerald-400" />
                  {server.quality || '1080p'}
                </span>
                {isSelected && (
                  <ShieldCheck className="h-4 w-4 text-red-500 ml-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helpful Hint */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="text-amber-400">⚡</span>
          <span>Tip: If audio desyncs or freezes, switch between Sun and Bee servers.</span>
        </span>
      </div>
    </div>
  );
};
