# DailyFresh Connect - Street Food Vendor Platform

## Overview

DailyFresh Connect is a modern web application designed to empower Indian street food vendors with AI-powered predictions, collaborative purchasing through group buys, and sustainable food rescue features. The platform serves both vendors and buyers, creating an ecosystem that reduces food waste and improves business efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful endpoints with proper error handling middleware
- **Development**: Hot reload with Vite integration for seamless development

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured via Neon Database serverless)
- **Schema**: Comprehensive schema with user roles, vendor profiles, predictions, group buys, rescue items, and reviews
- **Storage Implementation**: In-memory storage for development with interface for easy database migration

## Key Components

### Authentication System
- JWT token-based authentication
- Role-based access control (vendor/buyer)
- Secure password hashing with bcrypt
- Local storage for token persistence

### AI Prediction Module
- Weather-based ingredient predictions
- Integration ready for OpenWeatherMap API
- Simulated prediction logic for development
- Confidence scoring for predictions

### Group Buy System
- Collaborative purchasing for vendors
- Real-time progress tracking
- Participant management
- Status tracking (active/completed/cancelled)

### Food Rescue System
- Listing of prepared and raw food items
- Discount pricing for waste reduction
- Item claiming functionality
- Status management for rescue items

### Trust Profile System
- Vendor trust scoring based on activities
- Badge system for verified vendors
- Activity tracking for trust building
- Review and rating system

## Data Flow

1. **User Authentication**: Login/register → JWT token → Role-based dashboard routing
2. **AI Predictions**: Vendor city input → Weather API → Prediction algorithm → Dashboard display
3. **Group Buys**: Create/join group buy → Real-time updates → Completion tracking
4. **Food Rescue**: List items → Browse by buyers → Claim process → Status updates
5. **Trust Building**: Activity completion → Score calculation → Badge assignment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **drizzle-orm**: Database ORM and migrations
- **bcrypt & jsonwebtoken**: Authentication security
- **react-hook-form & zod**: Form validation

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **ESBuild**: Production build optimization

### Future Integrations
- **OpenWeatherMap API**: Weather data for predictions
- **Supabase**: Production database and authentication (infrastructure ready)
- **Facebook Prophet**: Advanced prediction algorithms

## Deployment Strategy

### Development Environment
- Vite development server with hot reload
- In-memory storage for rapid prototyping
- TypeScript compilation with strict mode
- Replit-optimized configuration

### Production Build
- ESBuild bundling for server code
- Vite static asset optimization
- Environment variable configuration
- Database migration system ready

### Scaling Considerations
- Database connection pooling via Neon serverless
- JWT stateless authentication for horizontal scaling
- API rate limiting ready for implementation
- CDN-ready static asset structure

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- JWT_SECRET for authentication security
- OPENWEATHER_API_KEY for weather integration
- Flexible environment variable system

The application follows a modular architecture pattern with clear separation between client and server code, shared type definitions, and a scalable database schema designed for rapid feature development and deployment.