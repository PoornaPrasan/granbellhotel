const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/billings', require('./routes/billingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Grand Bell Hotel API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001;

const startServer = async () => {
  try {
    await connectDB();

    let port = DEFAULT_PORT;

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      try {
        const { scheduleNoShowCancellation } = require('./jobs/noShowCancellation');
        scheduleNoShowCancellation();
        console.log('No-show cancellation job scheduled for 19:00 daily');
      } catch (e) {
        console.error('Failed to schedule no-show cancellation job:', e.message);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
        port += 1;
        server.listen(port);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
    process.exit(1);
  }
};

startServer();
