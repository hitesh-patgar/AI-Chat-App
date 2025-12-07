# AI Chat App

This project is a full-stack AI chat application built for the Fubotics Software & AI Internship assignment.

## Tech Stack
- **Frontend:** React (Vite), Axios
- **Backend:** Node.js, Express
- **AI Model:** Google Gemini (via `@google/generative-ai`)
- **Storage:** JSON file (`messages.json`) for persistent chat history

## Features
- Chat-style UI with user and AI messages.
- Backend API:
  - `POST /api/chat` – accepts user message, calls Gemini, stores both user + AI messages, returns updated conversation.
  - `GET /api/history` – returns full stored chat history.
- Chat history persists across page refreshes.
- Deployed:
  - Frontend on Vercel.
  - Backend on Render.
