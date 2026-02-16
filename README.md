# Nivaas - AI-Powered Rental Platform for Students

A full-stack web application to help students find rental accommodations in Kathmandu without brokers. Built with MERN stack + AI recommendations.

## Features
- User authentication (Students, Property Owners, Admin)
- Property listing with facilities (wifi, water, electricity)
- Search and filter properties
- AI-powered personalized recommendations (in progress)
- Owner dashboard to manage listings

## Tech Stack
- **Frontend:** React.js, Material-UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI/ML:** Python, Scikit-learn (planned)
- **Deployment:** Vercel/Netlify (frontend), Render/Railway (backend)

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # update with your MongoDB URI and JWT secret
npm run dev