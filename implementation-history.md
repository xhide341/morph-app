# 🕰️ Pomodoro App - MVP Plan

## 🚀 Project Overview

A **Minimal Viable Product (MVP)** for a Pomodoro app using **React, Express, Node.js** and **Redis** for real-time features.  
The goal is to create a functional Pomodoro timer with **basic customization** and **user authentication**.

---

## ✅ MVP Scope

### **📌 Core Features (Must-Have)**

- ✅ **Pomodoro Timer** – Countdown logic with start/pause/reset
- ✅ **Session Customization** – Change default 25-minute timer
- ✅ **User Authentication** (Better Auth.js) – Login, Register, Logout
- ✅ **Theme Variants** – Theme toggle (stored in localStorage)
- ✅ **Quote of the Day** – Daily quote from an API

### **🚀 Optional Enhancements (After MVP)**

- 🔹 **Session History** – Track past focus sessions
- 🔹 **Notifications** – Sound/vibration when session ends

---

## 🛠️ Tech Stack

- **Frontend:** Vite + React-Ts + TailwindCSS
- **Backend:** Express + Node.js
- **Authentication:** Better Auth.js
- **State & Cache:** Redis

---

## 📂 Folder Structure

- **client:** React + Vite + TailwindCSS
- **server:** Express + Node.js
- **common:** Shared types and utilities

## Progress Bar Component Addition

- Created new ProgressBar component in `client/src/components/progress-bar.tsx`

  - Added interface `ProgressBarProps` with `currentTime` and `totalTime` props
  - Implemented `calculateProgress` function to convert time strings to percentage
  - Added smooth transition animation with `transition-all duration-1000`
  - Used Tailwind classes for styling (h-2, rounded-full, etc.)
  - Fixed progress calculation to start from left (0%) and increase to right (100%)

- Modified Clock component in `client/src/components/clock.tsx`
  - Imported ProgressBar component
  - Added ProgressBar to Clock's render method
  - Connected timer state to ProgressBar by passing:
    - `currentTime={time}`
    - `totalTime={timerMode === "work" ? lastWorkTime : lastBreakTime}`
  - Adjusted layout to accommodate progress bar with `w-full` class
  - Fixed timer logic to stop at 00:00 instead of going negative

## Redis Integration

### Redis Setup

- Added Redis client configuration in `server/src/config/redis.ts`
  - Configured Redis URL from environment variables
  - Added connection error handling
  - Implemented connection status logging
  - Created connectRedis utility function

### Data Storage Implementation Plan

- Using Redis for:
  - Real-time features and activity tracking
  - Temporary data and session management
  - Room state and user presence
  - Timer history and analytics
  - Following real-time application patterns
  - Implemented lookup pattern for frequently accessed data

### Next Steps

- Set up Redis for room activity tracking
- Add data persistence layer for completed sessions
- Implement activity batching for performance

## WebSocket Activity Tracking Flow

### Client-Side (useActivityTracker.ts)

1. Local Activity Creation

   - Generate new activity with UUID
   - Add to local state immediately
   - Send to WebSocket server

2. WebSocket Handler
   - Receive broadcast activities
   - Check for duplicates using activity.id
   - Update state if not duplicate

### Server-Side (index.ts)

1. Connection Handler

   - Parse room ID from URL
   - Send connection confirmation
   - Setup message handlers

2. Message Processing
   - Store client info on join activities
   - Save activity to Redis
   - Broadcast to all room clients

### Activity Flow

1. Client adds activity locally
2. Activity sent to WebSocket server
3. Server processes and broadcasts
4. Client receives broadcast
5. Duplicate check prevents double entries

### Next Steps

- Add activity type filtering
- Implement activity persistence
- Add error recovery for disconnections
- Add activity batching for performance

## Room Creation

1. Create room only in session page
2. redirect to room page
3. room page has username modal that will be responsible for user join activity
