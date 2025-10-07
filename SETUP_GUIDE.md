# Hotel Grand Bell - Setup Guide

## 🚨 Issue Fixed: Reservation Data Not Saving to Database

The problem was that the frontend was using mock data (in-memory storage) instead of making real API calls to the backend database. I've now connected the frontend to the backend API.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** running locally
3. **npm** or **yarn**

## 🛠️ Setup Instructions

### 1. Install Dependencies

From the project root:
```bash
npm run install:all
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:
```bash
# Backend Environment Variables
PORT=3001
MONGODB_URI=mongodb://localhost:27017/grandbellhotel
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Start MongoDB

**Windows:**
- Start MongoDB service from Services
- Or run: `mongod` in command prompt

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Seed the Database

```bash
cd backend
node seedData.js
```

This creates:
- Default users (admin, manager, clerk, customer, travel company)
- Sample rooms
- A sample reservation

### 5. Start the Application

**Option 1: Start both frontend and backend together**
```bash
npm run dev
```

**Option 2: Start separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 🔑 Default Login Credentials

After seeding, you can login with:

- **Admin**: admin@granbell.com / admin123
- **Manager**: manager@granbell.com / manager123
- **Clerk**: clerk@granbell.com / clerk123
- **Customer**: customer@example.com / customer123
- **Travel Company**: travel@company.com / travel123

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🔧 What Was Fixed

### Before (The Problem):
- Frontend used mock data in `HotelContext`
- No real API calls to backend
- Reservations only stored in browser memory
- Data lost on page refresh

### After (The Solution):
- ✅ Created API service layer (`frontend/src/services/api.ts`)
- ✅ Updated `HotelContext` to use real API calls
- ✅ Connected frontend to backend database
- ✅ Reservations now persist in MongoDB
- ✅ Proper error handling and loading states

## 🧪 Testing the Fix

1. Start both servers
2. Login as a customer
3. Create a new reservation
4. Check that it appears in the reservations list
5. Refresh the page - reservation should still be there
6. Check MongoDB to confirm data is stored

## 📁 Project Structure

```
project/
├── package.json          # Root package.json (monorepo)
├── frontend/             # React frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts    # API service layer
│   │   ├── contexts/
│   │   │   └── HotelContext.tsx  # Updated to use real APIs
│   │   └── components/
│   └── package.json
└── backend/              # Express backend
    ├── .env              # Environment variables
    ├── models/           # MongoDB models
    ├── controllers/      # API controllers
    ├── routes/          # API routes
    └── package.json
```

## 🚀 Available Commands

- `npm run dev` - Run both frontend and backend
- `npm run dev:frontend` - Run only frontend
- `npm run dev:backend` - Run only backend
- `npm run build` - Build both applications
- `npm run install:all` - Install all dependencies

## 🔍 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the MONGODB_URI in backend/.env

**API Connection Error:**
- Ensure backend is running on port 3001
- Check browser console for CORS errors

**Authentication Issues:**
- Clear browser localStorage
- Re-login with default credentials

The reservation creation issue should now be completely resolved! 🎉
