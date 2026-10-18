import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AnimePage } from './pages/AnimePage';
import { MangaPage } from './pages/MangaPage';
import { TrendingPage } from './pages/TrendingPage';
import { LibraryPage } from './pages/LibraryPage';
import { WatchPage } from './pages/WatchPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-slate-950">
          <Header />
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/manga" element={<MangaPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/watch/:id/:episode" element={<WatchPage />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-heading font-medium text-slate-400">
                Ainz<span className="text-red-500">Anime</span> © {new Date().getFullYear()} — Powered by Jikan & MangaDex API
              </p>
              <p className="text-slate-500">
                Crafted for anime & manga enthusiasts
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
