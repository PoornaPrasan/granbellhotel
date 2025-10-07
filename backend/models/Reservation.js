const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Please add customer name'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Please add customer email'],
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'Please add customer phone'],
    trim: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please add check-in date']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please add check-out date']
  },
  guests: {
    type: Number,
    required: [true, 'Please add number of guests'],
    min: 1
  },
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'confirmed'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount'],
    min: 0
  },
  depositAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash', 'pending'],
    default: 'pending'
  },
  cardDetails: {
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  specialRequests: {
    type: String,
    trim: true
  },
  isCompanyBooking: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

reservationSchema.pre('save', function(next) {
  if (this.checkOutDate <= this.checkInDate) {
    next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
