# 🕰️ Pomodoro App - MVP Plan

## 🚀 Project Overview

A **Minimal Viable Product (MVP)** for a Pomodoro app using **React, Express, Node.js** with real-time features.  
The goal is to create a functional Pomodoro timer with **basic customization** and **room-based collaboration**.

---

## ✅ MVP Scope

### **📌 Core Features (Must-Have)**

- ✅ **Pomodoro Timer** – Countdown logic with start/pause/reset
- ✅ **Session Customization** – Change default 25-minute timer
- ✅ **Room Creation** – Create and join focus rooms
- ✅ **Theme Variants** – Theme toggle (stored in localStorage)
- ✅ **Quote of the Day** – Daily quote from an API

### **🚀 Optional Enhancements (After MVP)**

- 🔹 **Session History** – Track past focus sessions
- 🔹 **Notifications** – Sound/vibration when session ends

---

## 🛠️ Tech Stack

- **Frontend:** Vite + React-Ts + TailwindCSS
- **Backend:** Express + Node.js
- **Real-time:** Socket.IO
- **State & Cache:** Redis

---

## 📂 Folder Structure

- **client:** React + Vite + TailwindCSS
- **server:** Express + Node.js
- **common:** Shared types and utilities
