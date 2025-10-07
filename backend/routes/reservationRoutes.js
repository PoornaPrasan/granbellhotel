const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  checkIn,
  checkOut,
  deleteReservation
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllReservations)
  .post(createReservation);

router.route('/:id')
  .get(getReservation)
  .put(updateReservation)
  .delete(deleteReservation);

router.put('/:id/cancel', cancelReservation);

router.put('/:id/checkin', authorize('admin', 'manager', 'clerk'), checkIn);

router.put('/:id/checkout', authorize('admin', 'manager', 'clerk'), checkOut);

module.exports = router;
