const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'residential'],
    required: [true, 'Please add a room type']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add room capacity'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'Please add room price'],
    min: 0
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  floor: {
    type: Number,
    required: [true, 'Please add floor number']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
