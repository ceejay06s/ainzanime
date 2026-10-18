import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Flame, BookOpen, TrendingUp, Heart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg shadow-lg shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-netflix shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading font-extrabold text-white text-xl tracking-wide group-hover:text-red-400 transition-colors">Ainz<span className="text-red-500">Anime</span></span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/" icon={<Home className="h-5 w-5" />} label="Home" />
            <NavLink to="/anime" icon={<Flame className="h-5 w-5" />} label="Anime" />
            <NavLink to="/manga" icon={<BookOpen className="h-5 w-5" />} label="Manga" />
            <NavLink to="/trending" icon={<TrendingUp className="h-5 w-5" />} label="Trending" />
            <NavLink to="/library" icon={<Heart className="h-5 w-5" />} label="Library" />
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
);
