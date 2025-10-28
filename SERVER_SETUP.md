# Database Setup Guide

Your project is already configured to use PostgreSQL with Drizzle ORM. Here are the free database options:

## Recommended: **Neon** (Best for Next.js)

### Why Neon?
- ✅ Completely free tier (no credit card required)
- ✅ 0.5 GB storage, unlimited projects
- ✅ Serverless Postgres
- ✅ Automatic scaling
- ✅ Already has `@neondatabase/serverless` installed
- ✅ Works seamlessly with Drizzle

### Setup Steps:

1. **Sign up for Neon**: https://neon.tech/
2. **Create a new project**
3. **Get your connection string** from the dashboard
4. **Add to your `.env.local` file**:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
5. **Run migrations**:
   ```bash
   npm run db:push
   ```

## Alternative Options:

### Supabase (Also Great!)
- PostgreSQL with extra features
- Built-in auth, storage, real-time
- Free tier: 500 MB database, 1 GB file storage
- https://supabase.com/

### Turso (SQLite-based)
- Very fast, lightweight
- Good for smaller apps
- Free tier: 500 MB, 5 databases
- https://turso.tech/

### Vercel Postgres (If deploying on Vercel)
- Integrated with Vercel
- Free tier available
- Postgres database
- https://vercel.com/docs/storage/vercel-postgres

## Current Setup

Your project is configured with:
- ✅ Drizzle ORM
- ✅ Schema already defined (`shared/schema.ts`)
- ✅ Migrations configured (`drizzle.config.ts`)
- ✅ Serverless driver installed (`@neondatabase/serverless`)

## After Database Setup

Once you've added the `DATABASE_URL`:
1. Run `npm install` to ensure all packages are installed
2. Run `npm run db:push` to create tables
3. The application now uses `DatabaseStorage` for all data operations

