# replit.md

## Overview

This is a modern full-stack web application built with React, Express.js, and TypeScript. The application serves as a personal portfolio website with contact form functionality. It uses a modern tech stack including Vite for frontend bundling, TailwindCSS for styling, and shadcn/ui for UI components.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: TailwindCSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth animations and transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with fallback to PostgreSQL
- **Development**: Hot reloading with Vite integration

## Key Components

### Client-Side Components
- **Navigation**: Fixed navigation with smooth scrolling
- **Hero Section**: Landing page with animated background elements
- **About Section**: Personal information with social media links
- **Skills Section**: Interactive skill bars with progress animations
- **Projects Section**: Filterable project showcase
- **Gallery Section**: Image gallery with lightbox functionality
- **Contact Section**: Contact form with validation and API integration
- **Footer**: Site footer with social links

### Server-Side Components
- **API Routes**: RESTful endpoints for contact form submission
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Database Schema**: User and contact tables with proper typing
- **Error Handling**: Centralized error handling middleware

## Data Flow

1. **Client Request**: User interacts with the frontend (React components)
2. **Form Validation**: Client-side validation using React Hook Form and Zod
3. **API Call**: Frontend sends requests to Express.js backend via React Query
4. **Server Processing**: Express routes handle requests and validate data
5. **Database Operations**: Data is stored using Drizzle ORM with PostgreSQL
6. **Response**: Server sends response back to client
7. **UI Updates**: React Query updates the UI based on response

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Libraries**: Radix UI components, shadcn/ui, Framer Motion
- **Form Management**: React Hook Form, Zod validation
- **State Management**: TanStack React Query
- **Styling**: TailwindCSS, class-variance-authority, clsx
- **Icons**: Lucide React icons

### Backend Dependencies
- **Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM, PostgreSQL, Neon Database driver
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, Vite for development

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **CSS Processing**: PostCSS with TailwindCSS and Autoprefixer
- **Database Tools**: Drizzle Kit for database migrations

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx with nodemon-like functionality for auto-restart
- **Database**: Uses DATABASE_URL environment variable for connection

### Production
- **Build Process**: 
  - Frontend builds to `dist/public` directory
  - Backend builds to `dist` directory using esbuild
- **Serving**: Express serves built React app as static files
- **Database**: PostgreSQL connection via environment variables

### Environment Configuration
- **Development**: `NODE_ENV=development` with Vite integration
- **Production**: `NODE_ENV=production` with static file serving
- **Database**: Requires `DATABASE_URL` environment variable

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Elegant premium, minimalist and ultramodern design.

## Recent Changes

- July 07, 2025: Updated entire portfolio design to premium minimalist aesthetic
  - Implemented monochromatic black/white/gray color palette
  - Added subtle geometric elements and clean lines
  - Updated typography with Inter font family and reduced weights
  - Redesigned all components with minimalist approach
  - Added grayscale image effects with hover color transitions
  - Implemented clean form designs with underline inputs
  - Enhanced spacing and layout for premium feel
- July 07, 2025: Switched to white background with black accents
  - Inverted color scheme for cleaner, modern aesthetic
  - Updated all components to work with white background
  - Maintained premium minimalist design approach
- July 07, 2025: Added PostgreSQL database integration
  - Initially created PostgreSQL database with Neon
  - Switched to Supabase PostgreSQL database
  - Implemented DatabaseStorage class using Drizzle ORM
  - Replaced in-memory storage with persistent database storage
  - Contact form submissions now stored in database
- July 07, 2025: Made application self-contained for deployment outside Replit
  - Created comprehensive README.md with installation and deployment instructions
  - Added .env.example file for environment variable configuration
  - Created automated setup.sh script for easy project initialization
  - Added deploy.md with deployment guides for multiple platforms
  - Enhanced server with health check endpoint and better error handling
  - Improved environment variable handling for PORT configuration
  - Updated .gitignore to exclude sensitive files and build artifacts

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Premium minimalist design implementation
- July 07, 2025. White background with black accents
- July 07, 2025. PostgreSQL database integration
- July 07, 2025. Self-contained deployment configuration