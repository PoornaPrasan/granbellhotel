const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['room_service', 'restaurant', 'laundry', 'minibar', 'other'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const billingSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomCharges: {
    type: Number,
    required: true,
    min: 0
  },
  additionalCharges: [billingItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash'],
    required: true
  }
}, {
  timestamps: true
});

billingSchema.pre('save', function(next) {
  const additionalTotal = this.additionalCharges.reduce((sum, item) => sum + item.amount, 0);
  this.totalAmount = this.roomCharges + additionalTotal;

  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }

  next();
});

module.exports = mongoose.model('Billing', billingSchema);
