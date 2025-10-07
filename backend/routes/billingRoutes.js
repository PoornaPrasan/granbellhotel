const express = require('express');
const router = express.Router();
const {
  getAllBillings,
  getBilling,
  createBilling,
  updateBilling,
  addCharge,
  processPayment,
  getBillingByReservation
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllBillings)
  .post(authorize('admin', 'manager', 'clerk'), createBilling);

router.get('/reservation/:reservationId', getBillingByReservation);

router.route('/:id')
  .get(getBilling)
  .put(authorize('admin', 'manager', 'clerk'), updateBilling);

router.post('/:id/charges', authorize('admin', 'manager', 'clerk'), addCharge);

router.post('/:id/payment', authorize('admin', 'manager', 'clerk'), processPayment);

module.exports = router;
