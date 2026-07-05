# AinzAnime - Setup Guide

## Prerequisites

- Node.js 16+ and npm/yarn
- Git
- Modern web browser

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ceejay06s/ainzanime.git
cd ainzanime
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the server (runs on http://localhost:5000)
npm run dev
```

**Backend Environment Variables (.env):**
```env
PORT=5000
NODE_ENV=development
JIKAN_API_URL=https://api.jikan.moe/v4
MANGADEX_API_URL=https://api.mangadex.org
CORS_ORIGIN=http://localhost:5173
CACHE_TTL=3600
```

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## API Endpoints Summary

### Anime Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/anime/trending` | GET | Get trending anime |
| `/api/anime/search` | GET | Search anime |
| `/api/anime/top` | GET | Get top rated anime |
| `/api/anime/:id` | GET | Get anime details |
| `/api/anime/:id/episodes` | GET | Get anime episodes |
| `/api/anime/:id/characters` | GET | Get anime characters |
| `/api/anime/genre/:genreId` | GET | Get anime by genre |

### Manga Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/manga/trending` | GET | Get trending manga |
| `/api/manga/search` | GET | Search manga |
| `/api/manga/:id` | GET | Get manga details |
| `/api/manga/:id/chapters` | GET | Get manga chapters |
| `/api/manga/chapter/:chapterId/pages` | GET | Get chapter pages |
| `/api/manga/tags` | GET | Get all tags |
| `/api/manga/tag/:tagId` | GET | Search manga by tag |

## Project Structure

```
ainzanime/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── services/          # API integrations
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand state
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/                       # Documentation
│   ├── SETUP.md
│   ├── API.md
│   └── FEATURES.md
└── README.md
```

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm preview
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Modules Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## Technology Stack

**Frontend**: React 18 + TypeScript + Tailwind CSS + React Query + Zustand  
**Backend**: Node.js + Express + TypeScript  
**APIs**: Jikan v4 + MangaDex v5

## Support

Issues? Check [GitHub Issues](https://github.com/ceejay06s/ainzanime/issues)
