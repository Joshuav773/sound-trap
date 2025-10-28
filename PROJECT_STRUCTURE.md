# SoundTrap Project Structure

## Clean Next.js Project Structure

```
Sound-trap/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── beats/           # Beat CRUD endpoints
│   │   ├── admin/           # Admin upload endpoint
│   │   ├── purchases/       # Purchase handling
│   │   ├── downloads/       # Download endpoint
│   │   └── uploads/         # Static file serving
│   ├── admin/               # Admin page
│   │   └── page.tsx
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── providers.tsx        # React Query provider
│
├── components/               # React components
│   ├── ui/                  # shadcn/ui components (49 files)
│   ├── AudioPlayer.tsx
│   ├── BeatCard.tsx
│   ├── BeatLibrary.tsx
│   ├── FeaturedSection.tsx
│   ├── Header.tsx
│   ├── SearchFilters.tsx
│   ├── UploadModal.tsx
│   └── Waveform.tsx
│
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                     # Utility functions
│   └── utils.ts
│
├── server/                   # Server-side code
│   └── storage.ts           # In-memory data storage
│
├── shared/                  # Shared types/schemas
│   └── schema.ts           # Database schemas
│
├── uploads/                 # Uploaded beat files
├── public/                 # Public static files
│
├── .gitignore
├── README.md
├── components.json          # shadcn/ui config
├── drizzle.config.ts        # Drizzle ORM config
├── next.config.js           # Next.js config
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Key Files

### Pages
- `app/page.tsx` - Home page with beat browsing
- `app/admin/page.tsx` - Admin upload page

### API Routes
- `app/api/beats/route.ts` - GET all beats
- `app/api/beats/[id]/route.ts` - GET single beat
- `app/api/beats/featured/route.ts` - GET featured beats
- `app/api/admin/beats/route.ts` - POST upload beat
- `app/api/purchases/route.ts` - POST purchase
- `app/api/downloads/[beatId]/route.ts` - GET download info
- `app/api/uploads/[[...path]]/route.ts` - Serve uploaded files

### Storage
- `server/storage.ts` - Storage interface and exports DatabaseStorage
- `server/dbStorage.ts` - Database-backed storage implementation using Drizzle ORM

