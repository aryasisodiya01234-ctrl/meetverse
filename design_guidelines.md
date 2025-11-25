# Video Meeting Web App - Design Guidelines

## Design Approach
**System-Based Approach**: Material Design with influences from Google Meet, Zoom, and Microsoft Teams
**Rationale**: Video conferencing demands clarity, efficiency, and intuitive controls. Material Design provides the clean, structured foundation needed for real-time communication tools.

## Core Design Principles
1. **Clarity First**: Every control must be immediately recognizable
2. **Information Hierarchy**: Video feeds dominate, controls are accessible but not intrusive
3. **Responsive Grid Logic**: Video layout adapts intelligently to participant count
4. **Persistent Access**: Critical controls always visible, secondary controls in accessible menus

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
- Tight spacing (2-4) for control bars and compact UI
- Medium spacing (6) for separating functional zones
- Generous spacing (8) for major layout divisions

**Application Structure**:
- **Main Video Grid**: Full viewport minus control bars (flex-1, grid auto-layout)
- **Bottom Control Bar**: Fixed height (h-16 to h-20), always visible, centered controls
- **Side Panel** (chat/participants): Fixed width (w-80 on desktop), slides in/out, full height
- **Top Bar**: Meeting info, participant count, minimal height (h-14)

## Typography Hierarchy
**Font Families**: 
- Primary: Inter or Roboto (clarity at small sizes)
- Monospace: JetBrains Mono for meeting codes

**Scale**:
- Meeting titles: text-lg font-semibold
- Participant names: text-sm font-medium (overlays on video)
- Control labels: text-xs
- Chat messages: text-sm
- Meeting codes: text-2xl font-mono font-bold

## Component Library

### Video Grid Layout
- **1 participant**: Full viewport, centered
- **2 participants**: 2-column grid (grid-cols-2)
- **3-4 participants**: 2x2 grid (grid-cols-2 grid-rows-2)
- **5-9 participants**: 3x3 grid (grid-cols-3)
- **10+ participants**: Scrollable grid, featured speaker view option
- Each video tile has rounded corners (rounded-lg), participant name overlay (bottom-left, p-2), muted indicator (icon, top-right)

### Control Bar Components
**Primary Controls** (always visible, center):
- Microphone toggle (large, circular button)
- Camera toggle (large, circular button)
- End call (red, rectangular, px-6)
- Screen share (circular button)
- Chat toggle (circular button with unread badge)

**Secondary Controls** (right side):
- More options menu (3-dot icon)
- Participant list toggle (people icon with count)

**Meeting Info** (left side):
- Meeting code display (click to copy)
- Duration timer

### Side Panel Design
**Chat Panel**:
- Message list (flex-1, overflow-y-auto)
- Input field (fixed bottom, h-12, rounded-lg border)
- Send button (attached to input)
- Timestamp for messages (text-xs, muted)
- Sender name bold for each message

**Participants Panel**:
- Searchable list
- Each participant row: avatar/initials, name, mic/camera status icons
- Host badge for meeting creator
- Hover reveals action menu (mute, remove - host only)

### Pre-Meeting Lobby
- Centered card (max-w-2xl, p-8, rounded-2xl, shadow-xl)
- Large preview of user's camera (rounded-lg, aspect-video)
- Device selection dropdowns (camera, microphone, speaker)
- Join controls preview (mute mic/camera before joining)
- Meeting name/code display at top
- Join button (large, primary, w-full)

### Meeting Creation/Join Screen
- Centered layout (max-w-md)
- Two primary actions:
  - "New Meeting" button (large, primary)
  - "Join with Code" input field (text-center, text-2xl, tracking-wide for code entry)
- Recently accessed meetings list below (if applicable)

### Notifications/Toasts
- Top-right corner positioning (fixed, top-4, right-4)
- Compact height (h-14), rounded-lg
- Auto-dismiss after 4 seconds
- Icon + message + close button
- Examples: "Participant joined", "Mic muted by host", "Link copied"

### Loading States
- Video tiles: Skeleton with pulsing background while loading
- Connecting state: Centered spinner in video grid
- Joining meeting: Progress indicator with status text

## Interaction Patterns
- **Hover States**: Control buttons scale slightly (scale-105), show tooltips
- **Active States**: Buttons show pressed state (scale-95)
- **Toggle States**: Mic/camera buttons show clear on/off visual (muted has slash-through icon, different background treatment)
- **Drag Handles**: Chat/participant panel has subtle resize handle
- **Keyboard Shortcuts**: Space (mute toggle), Cmd/Ctrl+D (camera toggle), Cmd/Ctrl+E (end call)

## Responsive Behavior
- **Desktop** (lg:): Side panel beside video grid, full control bar
- **Tablet** (md:): Side panel overlays video grid, condensed controls
- **Mobile** (base): Not primary target (show message to use desktop/tablet)

## Accessibility Standards
- All controls have ARIA labels
- Keyboard navigation for all interactive elements
- Screen reader announcements for participant join/leave, mute events
- Focus visible on all interactive elements
- High contrast mode support for control icons

No hero images required - this is a functional application interface focused on video communication.