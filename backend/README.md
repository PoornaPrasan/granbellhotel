# Grand Bell Hotel - Backend API

Node.js + Express + MongoDB backend for the hotel reservation system.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB running on localhost:27017
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit the `.env` file if needed. Default settings:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/grandbellhotel
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

## Database Setup

1. Make sure MongoDB is running on your local machine:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows, start MongoDB service from Services
```

2. Seed the database with initial data:
```bash
node seedData.js
```

This will create:
- Default users (admin, manager, clerk, customer, travel company)
- Sample rooms
- A sample reservation

### Default User Accounts

After seeding, you can login with these accounts:

- **Admin**: admin@granbell.com / admin123
- **Manager**: manager@granbell.com / manager123
- **Clerk**: clerk@granbell.com / clerk123
- **Customer**: customer@example.com / customer123
- **Travel Company**: travel@company.com / travel123

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `GET /api/rooms/available?checkIn=DATE&checkOut=DATE&type=TYPE` - Get available rooms
- `POST /api/rooms` - Create room (admin, manager only)
- `PUT /api/rooms/:id` - Update room (admin, manager, clerk)
- `DELETE /api/rooms/:id` - Delete room (admin, manager only)

### Reservations
- `GET /api/reservations` - Get all reservations (filtered by user role)
- `GET /api/reservations/:id` - Get single reservation
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `PUT /api/reservations/:id/cancel` - Cancel reservation
- `PUT /api/reservations/:id/checkin` - Check-in guest (staff only)
- `PUT /api/reservations/:id/checkout` - Check-out guest (staff only)

### Billing
- `GET /api/billings` - Get all billings
- `GET /api/billings/:id` - Get single billing
- `GET /api/billings/reservation/:reservationId` - Get billing by reservation
- `POST /api/billings` - Create billing (staff only)
- `PUT /api/billings/:id` - Update billing (staff only)
- `POST /api/billings/:id/charges` - Add additional charge (staff only)
- `POST /api/billings/:id/payment` - Process payment (staff only)

### Reports
- `GET /api/reports/daily?date=DATE` - Get daily report (admin, manager only)
- `GET /api/reports/monthly?year=YEAR&month=MONTH` - Get monthly report (admin, manager only)
- `GET /api/reports/revenue?startDate=DATE&endDate=DATE` - Get revenue report (admin, manager only)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Role-Based Access Control

Different endpoints have different permission requirements:
- **Public**: Login, Register
- **All Authenticated**: View own reservations, create reservations
- **Staff (admin, manager, clerk)**: Manage reservations, billing
- **Admin/Manager**: Create/delete rooms, view reports

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── roomController.js    # Room management
│   ├── reservationController.js
│   ├── billingController.js
│   └── reportController.js
├── middleware/
│   └── auth.js              # JWT authentication & authorization
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Reservation.js
│   └── Billing.js
├── routes/
│   ├── authRoutes.js
│   ├── roomRoutes.js
│   ├── reservationRoutes.js
│   ├── billingRoutes.js
│   └── reportRoutes.js
├── .env                     # Environment variables
├── server.js               # Main server file
├── seedData.js             # Database seeding script
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` or `mongo`
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

### Port Already in Use
- Change PORT in .env file
- Kill process using port 3001: `lsof -ti:3001 | xargs kill -9` (macOS/Linux)

### Authentication Errors
- Ensure JWT_SECRET is set in .env
- Check if token is included in Authorization header
- Verify token hasn't expired

## Development Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 30 days (configurable)
- CORS is enabled for all origins in development
- Dates should be sent in ISO format
