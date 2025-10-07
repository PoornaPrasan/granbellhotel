const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create room', error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update room', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, type } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Please provide checkIn and checkOut dates' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    let query = { status: { $ne: 'maintenance' } };
    if (type) {
      query.type = type;
    }

    const allRooms = await Room.find(query);

    const reservations = await Reservation.find({
      status: { $nin: ['cancelled', 'checked-out'] },
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });

    const bookedRoomIds = reservations.map(res => res.roomId.toString());

    const availableRooms = allRooms.filter(room =>
      !bookedRoomIds.includes(room._id.toString())
    );

    res.json({
      success: true,
      count: availableRooms.length,
      data: availableRooms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
