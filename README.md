# 🕰️ MORPH - Collaborative Pomodoro Timer

## 🎯 Project Overview

MORPH is a real-time collaborative Pomodoro timer that helps teams stay focused together.
Built as a practice for me to explore and experience:

- Real-time collaboration with Socket.IO
- Barebones React without meta-frameworks
- Native fetch API (no Axios/HTTP clients)
- Monorepo architecture patterns

## ✨ Features

- **⏱️ Flexible Timer Options**

  - Work sessions: 25/50 minutes
  - Break sessions: 5/15 minutes
  - Real-time sync across all room participants

- **🎨 Theme Variants**

  - Multiple theme options (Forest, Ocean, Coffee, Lavender)
  - Theme is persisted with localStorage and username is persisted with sessionStorage

- **🤝 Collaborative Rooms**

  - Create/join focus rooms
  - Real-time participant tracking
  - Shared timer controls
  - Activity log

- **💭 Daily Motivation**
  - Quote of the day feature
  - Refreshes daily (Free API)

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- TailwindCSS
- Socket.IO Client
- Vite

### Backend

- Node.js
- Express
- Socket.IO
- Redis (for state management)
- TypeScript

### Infrastructure

- **Client:** Vercel (for optimal static file serving)
- **Server:** Render (for persistent backend)
- **Database:** Redis Cloud

## 🏗️ Architecture

```
monorepo/
├── client/          # React frontend
├── server/          # Express backend
```

## 💡 Learning Outcomes

This project served as a practical exploration of:

- Building real-time features with Socket.
- State synchronization across multiple clients (I did not rely on global state libraries like Zustand)
- Working with React library (Firsthand experience without a framework)
- Using browser-native fetch API for HTTP requests (Barebones fetching without axios or fetchApi)
- Managing a monorepo structure (without a 'common' folder)
- Deploying to multiple platforms (Vercel + Render)

## 🚀 Deployment

- **Frontend:** [morph-app-plum.vercel.app](https://morph-app-plum.vercel.app)
- **Backend:** [morph-app.onrender.com](https://morph-app.onrender.com)

## 📝 Development Notes

- I used pnpm for package management, as usual.
- I did not spend a dime, everything used in this project are free tiers. (Vercel, Render, Redis hobbyist tiers)
- I did try barebones Websocket API but I spent alot of time managing fallbacks and creating my own event listeners so I opted for SocketIO instead.
- I used Redis just because I want to experience how good it is for temporary caching/storage.
- Also learned alot of best coding practices for combining sockets with database especially with really challenging edge cases.
- I made the design simple since my focus is mainly about implementing more on the backend and how they interact with react hooks. I would make it cooler with animations but its not a priority for me.
