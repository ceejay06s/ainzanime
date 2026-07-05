# AinzAnime - Anime & Manga Streaming Platform

A Netflix-inspired anime streaming platform with Webtoon-style manga reading capabilities.

## 🎬 Features

- **Anime Streaming**: Browse, search, and stream anime content
- **Manga Reading**: Webtoon-style manga chapter reader
- **Trending & Popular**: Discover trending anime and manga
- **Search & Filters**: Advanced search with genre, rating, and status filters
- **User Library**: Save favorites, create watchlists
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Detailed Info**: Ratings, synopsis, character info, episode guides

## 📡 APIs Used

- **[Jikan API v4](https://jikan.moe/)** - Comprehensive anime & manga database
- **[MangaDex API v5](https://api.mangadex.org/)** - Manga content and chapter data
- **YouTube API** - Anime trailers

## 🏗️ Tech Stack

### Frontend
- React 18.2 + TypeScript
- Tailwind CSS 3
- React Router v6
- Axios for API calls
- React Query for data fetching
- Lucide React icons

### Backend
- Node.js + Express
- CORS enabled
- Rate limiting
- Caching layer

## 📁 Project Structure

```
ainzanime/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── docs/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/ceejay06s/ainzanime.git
cd ainzanime

# Frontend
cd frontend && npm install && npm run dev

# Backend (in another terminal)
cd backend && npm install && npm run dev
```

Access at http://localhost:5173

## 📖 Documentation

See `/docs` folder for detailed setup and API documentation.

## 📝 License

MIT License
