# SoundTrap - Beat Marketplace 🎵

A modern beat selling platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🎶 Browse and search beats
- 🎧 Audio preview with waveform visualization
- 💰 Flexible pricing (lease and exclusive)
- 🔍 Advanced filtering (BPM, key, genre)
- ⭐ Featured beats section
- 📤 Admin panel for uploading beats
- 🎨 Modern dark theme UI

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Database ORM:** Drizzle (currently using in-memory storage)
- **File Upload:** Multer-like handling in Next.js API routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── beats/        # Beat CRUD operations
│   │   ├── admin/        # Admin upload endpoint
│   │   └── purchases/    # Purchase handling
│   ├── admin/            # Admin upload page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Site header
│   ├── BeatCard.tsx      # Beat display card
│   ├── BeatLibrary.tsx   # Beat grid
│   └── ...               # Other components
├── lib/                   # Utility functions
├── server/               # Server-side code
│   └── storage.ts        # In-memory data storage
└── shared/               # Shared schemas
    └── schema.ts        # Database schemas
```

## API Routes

- `GET /api/beats` - Get all beats (supports search/filter params)
- `GET /api/beats/featured` - Get featured beats
- `GET /api/beats/[id]` - Get specific beat
- `POST /api/admin/beats` - Upload new beat (admin only)
- `POST /api/purchases` - Create purchase
- `GET /api/downloads/[beatId]` - Get download info

## Pages

- `/` - Home page with beat browsing
- `/admin` - Admin beat upload page

## Environment Variables

Currently using in-memory storage. To use a database:

```env
DATABASE_URL=your_postgres_connection_string
```

Then update `server/storage.ts` to use the database implementation.

## Current Implementation

This project currently uses **in-memory storage** - all data is lost on server restart. It includes:
- 5 sample beats
- File upload functionality
- Search and filtering
- Purchase mock endpoints

## Migration from Vite/Express

This project was migrated from:
- Vite + Express to **Next.js App Router**
- Client-side routing (Wouter) to **Next.js file-based routing**
- Express API routes to **Next.js API routes**

## License

MIT

