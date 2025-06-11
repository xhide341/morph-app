# 🕰️ MORPH - Collaborative Pomodoro Timer

MORPH is a real-time collaborative Pomodoro timer that helps teams stay focused together.
Built as a practice for me to explore and experience:

- Real-time collaboration with Socket.IO
- Barebones React without meta-frameworks
- Native fetch API (no Axios/HTTP clients)
- Monorepo architecture patterns

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- TailwindCSS
- Socket.IO Client-side
- Vite

### Backend

- Node.js
- Express
- Socket.IO Server-side
- Redis (for state management)
- TypeScript

## 🏗️ Architecture

```
(monorepo)/
├── client/          # React frontend
├── server/          # Express backend
```

## 💡 Learning Outcomes

This project served as a practical exploration of:

- Building real-time features with WebSocket.
- State synchronization across multiple clients without relying on global state libraries like Zustand.
- Working with React library without a framework.
- Using browser-native fetch API for HTTP requests. No axios/fetchapi.
- Managing a monorepo structure.
- Deploying to multiple platforms (Vercel + Render).

## 📝 Development Notes

- I used pnpm for package management, as usual.
- I did not spend a dime, everything used in this project are free tiers (Vercel, Render, Redis hobbyist tiers).
- I tried barebones Websocket API but I spent alot of time managing fallbacks and creating my own event listeners so I opted for SocketIO instead.
- I used Redis just because I want to experience how good it is for temporary caching/storage.
- Also learned alot of best coding practices for combining sockets with database especially with really challenging edge cases.
- Decided to do simple and adaptive design to fit user preference.

## 🚀 Deployment

- **Frontend:** [morph-app-plum.vercel.app](https://morph-app-plum.vercel.app)
- **Backend:** [morph-app.onrender.com](https://morph-app.onrender.com)
