const express = require('express');
const router = express.Router();
const {
  getDailyOccupancyReport,
  getNoShowReport,
  getHotelOccupancyReport,
  getFinancialReport,
  getCheckoutStatement,
  getDailyReport,
  getMonthlyReport,
  getRevenueReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/daily-occupancy', authorize('admin', 'manager'), getDailyOccupancyReport);

router.get('/no-show', authorize('admin', 'manager', 'clerk'), getNoShowReport);

router.get('/hotel-occupancy', authorize('admin', 'manager', 'clerk', 'travel_company'), getHotelOccupancyReport);

router.get('/financial', authorize('admin', 'manager', 'clerk'), getFinancialReport);

router.get('/checkout-statement/:reservationId', getCheckoutStatement);

router.get('/daily', authorize('admin', 'manager'), getDailyReport);

router.get('/monthly', authorize('admin', 'manager'), getMonthlyReport);

router.get('/revenue', authorize('admin', 'manager'), getRevenueReport);

module.exports = router;
