# SoundTrap - Professional Beat Marketplace 🎵

A modern, trust-first beat selling platform designed to be the **best and easiest** marketplace for producers. Built to compete with and surpass BeatStars, Airbit, and Traktrain.

## 🚀 Key Features

### **Professional Selling Tools**
- 🎶 Beat marketplace with advanced search and filtering
- 🎧 Audio preview with waveform visualization
- 💰 Flexible pricing (lease and exclusive rights)
- 📋 **Standardized license templates** with plain-language summaries
- ✅ **Producer verification system** with trust badges and scores
- 🔑 **PRO membership verification** (ASCAP, BMI, SESAC)
- 🎁 **"Try Before You Buy"** - Free tagged demo downloads
- 🛒 **Cart abandonment recovery** system
- 📊 **Analytics dashboard** for producers

### **Trust & Security**
- ✅ Verified producer badges (Unverified, Verified, Premium, Elite)
- ✅ Trust score system (0-100 based on activity)
- ✅ Platform-level dispute resolution (coming soon)
- ✅ Secure payment processing
- ✅ Transparent pricing - 0% commission, 0% hidden fees

### **Virtual Listening Experience**
- 🎧 Artist-specific listening rooms
- 👥 Real-time connected users tracking
- 🔴 Live session management
- 🎤 Guest participation system

### **Admin & Management**
- 👥 User management system
- ✅ Producer verification panel
- 📊 Active rooms monitoring
- 🎵 Beat upload and management
- 💼 Admin-only pending store

## 🎯 Competitive Advantages

### **vs BeatStars:**
- ✅ **0% Commission** vs 12% service fee
- ✅ **No Bugs** vs broken Studio dashboard  
- ✅ **Trust System** vs rampant scamming
- ✅ **Transparent Pricing** vs hidden fees

### **vs Airbit:**
- ✅ **Modern UI** vs outdated interface
- ✅ **Human Curation** vs algorithm-only
- ✅ **Better Discovery** vs no marketplace traffic

### **vs Traktrain:**
- ✅ **Clear Fees** vs confusing commission structure
- ✅ **PRO Verification** vs no professional verification

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** TanStack Query (React Query)
- **Database:** PostgreSQL (Neon - Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** JWT-based system
- **Deployment:** Ready for Vercel/Netlify

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

## 🗄 Database Setup

1. **Create a Neon database** at [neon.tech](https://neon.tech)
2. **Copy your connection string** to `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname
   ```
3. **Push the schema** to your database:
   ```bash
   npm run db:push
   ```
4. **Populate with sample data** (optional):
   ```bash
   npm run db:populate
   ```

## 📊 Database Schema

- **users** - User accounts with verification fields
- **beats** - Producer beats with licensing
- **purchases** - Transaction records
- **store_products** - Loop packs and drum kits
- **license_templates** - Standardized licensing
- **abandoned_carts** - Cart recovery tracking
- **trial_downloads** - Demo download analytics

## 🎯 Pricing Model

- **Free Tier**: 25 beats, 15% commission
- **Pro Tier**: $99/year, 0% commission, 0% fees
- **Transparent**: No hidden costs

## 📝 Recent Updates

- ✅ Complete Next.js migration
- ✅ Producer verification system
- ✅ PRO membership verification (ASCAP/BMI/SESAC)
- ✅ Standardized license templates
- ✅ Try Before You Buy feature
- ✅ Cart abandonment tracking
- ✅ Database integration with Neon
- ✅ Virtual listening rooms

## License

MIT

