# Video Meeting Web Application

## Overview

This is a professional video conferencing web application that enables real-time video meetings with audio, video, chat, and screen sharing capabilities. The application follows Material Design principles inspired by Google Meet, Zoom, and Microsoft Teams, prioritizing clarity and efficient user interactions for video communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React hooks with TanStack React Query for server state
- **UI Framework:** Shadcn/ui components built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design tokens
- **Build Tool:** Vite for fast development and optimized production builds

**Design System:**
- Material Design-based approach with system primitives
- Consistent spacing using Tailwind units (2, 4, 6, 8)
- Typography hierarchy with Inter/Roboto for UI and JetBrains Mono for codes
- Custom color system supporting light/dark modes via CSS variables
- Component library focused on video conferencing UX patterns

**Page Structure:**
- **Home Page:** Meeting creation and joining interface
- **Pre-Meeting Page:** Device setup, audio/video preview, and configuration
- **Meeting Page:** Main video conferencing interface with grid layout, controls, and panels
- **Not Found Page:** 404 error handling

**Key UI Components:**
- Video Grid: Responsive grid that adapts layout based on participant count (1-10+ participants)
- Video Tile: Individual participant video with overlay controls and status indicators
- Control Bar: Fixed bottom bar with primary controls (mic, camera, screen share, end call)
- Chat Panel: Sliding side panel for text messaging with real-time updates
- Participants Panel: Side panel showing participant list with host controls

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **WebSocket:** Socket.IO for real-time bidirectional communication
- **Database:** PostgreSQL via Neon serverless driver
- **ORM:** Drizzle ORM for type-safe database queries
- **Session Management:** Express sessions with PostgreSQL store (connect-pg-simple)

**Server Structure:**
- Development server (`index-dev.ts`): Integrates Vite middleware for HMR
- Production server (`index-prod.ts`): Serves pre-built static assets
- Modular route registration system
- HTTP request logging middleware

**Real-Time Communication:**
- **WebRTC:** Peer-to-peer video/audio using SimplePeer library
- **Signaling:** Socket.IO handles WebRTC offer/answer exchange
- **STUN Servers:** Google STUN servers for NAT traversal
- **Peer Management:** Client-side peer connection tracking and stream handling

**Data Models:**
- **Meeting:** Unique code, host ID, creation timestamp
- **Participant:** Name, host status, media states (muted, video off, screen sharing)
- **ChatMessage:** Sender info, message content, timestamp

**Storage Strategy:**
- In-memory storage implementation (`MemStorage` class) for development
- Abstracted storage interface (`IStorage`) allows easy migration to persistent database
- Meetings, participants, and messages stored in Map structures keyed by meeting code/ID

### WebRTC Implementation

**Peer Connection Flow:**
1. User joins meeting via Socket.IO
2. Local media stream acquired from browser
3. For each existing participant, create peer connection
4. Initiator sends WebRTC offer via signaling server
5. Receiver responds with answer
6. ICE candidates exchanged for connection establishment
7. Direct peer-to-peer media streams established

**Media Handling:**
- Local stream management with getUserMedia API
- Device enumeration and selection (cameras, microphones)
- Stream muting/unmuting without renegotiation
- Screen sharing via getDisplayMedia API
- Video tile components bind streams to video elements

## External Dependencies

### Core Dependencies

**Frontend Libraries:**
- `react` & `react-dom`: UI framework
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Server state management
- `socket.io-client`: WebSocket client
- `simple-peer`: WebRTC peer connection wrapper
- `tailwindcss`: Utility-first CSS framework
- `date-fns`: Date formatting utilities

**UI Component Libraries:**
- `@radix-ui/*`: Headless UI primitives (accordion, dialog, dropdown, etc.)
- `class-variance-authority`: Component variant management
- `clsx` & `tailwind-merge`: Conditional className utilities
- `lucide-react`: Icon library
- `cmdk`: Command palette component
- `embla-carousel-react`: Carousel component
- `react-day-picker`: Calendar/date picker
- `recharts`: Chart library (for potential analytics)
- `vaul`: Drawer component

**Form Handling:**
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Form validation resolvers
- `zod`: Schema validation
- `drizzle-zod`: Drizzle ORM to Zod schema converter

**Backend Libraries:**
- `express`: Web framework
- `socket.io`: WebSocket server
- `drizzle-orm`: Type-safe ORM
- `@neondatabase/serverless`: Neon PostgreSQL driver
- `connect-pg-simple`: PostgreSQL session store
- `nanoid`: Unique ID generation

**Development Tools:**
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React support for Vite
- `typescript`: Type checking
- `tsx`: TypeScript execution
- `esbuild`: JavaScript bundler for production
- `drizzle-kit`: Database migration tool
- `@replit/vite-plugin-*`: Replit-specific development plugins

### Third-Party Services

**STUN Servers:**
- Google STUN servers (`stun.l.google.com:19302`, `stun1.l.google.com:19302`)
- Used for WebRTC NAT traversal and connection establishment

**Database:**
- Neon PostgreSQL (serverless)
- Connection via `DATABASE_URL` environment variable
- Schema managed through Drizzle migrations

**Fonts:**
- Google Fonts: Inter (primary UI), JetBrains Mono (monospace)
- Preconnected for performance optimization

### Configuration Files

- `components.json`: Shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS customization
- `tsconfig.json`: TypeScript compiler options
- `vite.config.ts`: Vite build configuration
- `drizzle.config.ts`: Database migration configuration
- `postcss.config.js`: PostCSS plugins (Tailwind, Autoprefixer)
