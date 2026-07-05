import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AnimePage } from './pages/AnimePage';
import { MangaPage } from './pages/MangaPage';
import { TrendingPage } from './pages/TrendingPage';
import { LibraryPage } from './pages/LibraryPage';

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
      <Router>
        <div className="min-h-screen bg-slate-950">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/manga" element={<MangaPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/library" element={<LibraryPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
