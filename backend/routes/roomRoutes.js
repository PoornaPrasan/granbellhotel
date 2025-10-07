const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', getAvailableRooms);

router.route('/')
  .get(getAllRooms)
  .post(protect, authorize('admin', 'manager'), createRoom);

router.route('/:id')
  .get(getRoom)
  .put(protect, authorize('admin', 'manager', 'clerk'), updateRoom)
  .delete(protect, authorize('admin', 'manager'), deleteRoom);

module.exports = router;
