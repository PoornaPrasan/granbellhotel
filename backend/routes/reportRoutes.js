const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getMonthlyReport,
  getRevenueReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/revenue', getRevenueReport);

module.exports = router;
