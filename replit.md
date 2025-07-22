# BeatStore - Beat Marketplace Application

## Overview

BeatStore is a modern full-stack beat marketplace web application that allows producers to upload and sell their beats while providing customers with search, preview, and purchase functionality. The application features a sleek dark-themed interface with comprehensive filtering options and licensing tiers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern monorepo architecture with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer middleware for handling beat file uploads
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Core Data Models
- **Beats**: Title, audio file, duration, BPM, key signature, tags, pricing (lease/exclusive), featured status
- **Purchases**: Customer information, purchase type (lease/exclusive), amount, timestamps

### Frontend Components
- **BeatCard**: Individual beat display with audio preview, pricing, and purchase options
- **AudioPlayer**: Custom audio playback controls with waveform visualization
- **SearchFilters**: Advanced filtering by genre, key, BPM range with real-time search
- **FeaturedSection**: Highlighted beats for promotional purposes
- **UploadModal**: Producer interface for beat submissions
- **Purchase Flow**: Customer information collection and transaction handling

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Beat Management**: CRUD operations for beats with search and filtering capabilities
- **File Handling**: Secure file upload with validation (MP3/WAV, 50MB limit)
- **Purchase Processing**: Transaction recording and customer data management

## Data Flow

1. **Beat Discovery**: Users browse through featured beats and search/filter the complete library
2. **Audio Preview**: Integrated audio player allows beat preview without full download
3. **Purchase Process**: Modal-based checkout with customer information collection
4. **Upload Workflow**: Producers can submit beats with metadata through a comprehensive form
5. **Real-time Updates**: React Query ensures UI stays synchronized with server state

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migrations and schema management

### UI & Styling
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Consistent icon library

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Frontend development with HMR
- **Express Server**: Backend API serving with automatic restart
- **File System**: Local storage for uploaded beats during development
- **In-Memory Storage**: Temporary data persistence for rapid prototyping

### Production Considerations
- **Static Assets**: Frontend built and served as static files
- **Server Bundle**: Express app bundled with ESBuild for deployment
- **Environment Variables**: Database URL and configuration through environment
- **File Storage**: Uploads directory for beat file storage (would need cloud storage for scale)

### Build Process
- `npm run dev`: Development mode with both frontend and backend
- `npm run build`: Production build creating optimized bundles
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

The architecture prioritizes developer experience with TypeScript throughout, component reusability with shadcn/ui, and maintainable code structure with clear separation of concerns between client and server responsibilities.