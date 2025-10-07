const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Billing = require('../models/Billing');

exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });

    const reservationsOnDate = await Reservation.find({
      checkInDate: { $lte: endOfDay },
      checkOutDate: { $gte: startOfDay },
      status: { $nin: ['cancelled'] }
    });

    const newReservations = await Reservation.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const checkedIn = await Reservation.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'checked-in'
    });

    const checkedOut = await Reservation.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'checked-out'
    });

    const cancelled = await Reservation.countDocuments({
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'cancelled'
    });

    const noShows = await Reservation.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'no-show'
    });

    const roomRevenue = reservationsOnDate.reduce((sum, res) => {
      const days = Math.ceil((res.checkOutDate - res.checkInDate) / (1000 * 60 * 60 * 24));
      return sum + (res.totalAmount / days);
    }, 0);

    const billings = await Billing.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const additionalRevenue = billings.reduce((sum, billing) => {
      return sum + billing.additionalCharges.reduce((chargeSum, charge) => chargeSum + charge.amount, 0);
    }, 0);

    const report = {
      date: startOfDay,
      occupancy: {
        total: totalRooms,
        occupied: occupiedRooms,
        percentage: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
      },
      revenue: {
        rooms: roomRevenue,
        additional: additionalRevenue,
        total: roomRevenue + additionalRevenue
      },
      reservations: {
        new: newReservations,
        checkedIn,
        checkedOut,
        cancelled,
        noShows
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const reportYear = year ? parseInt(year) : new Date().getFullYear();
    const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

    const totalRooms = await Room.countDocuments();

    const reservations = await Reservation.find({
      $or: [
        { checkInDate: { $gte: startDate, $lte: endDate } },
        { checkOutDate: { $gte: startDate, $lte: endDate } },
        {
          checkInDate: { $lte: startDate },
          checkOutDate: { $gte: endDate }
        }
      ]
    });

    const totalRevenue = reservations
      .filter(res => res.status !== 'cancelled')
      .reduce((sum, res) => sum + res.totalAmount, 0);

    const billings = await Billing.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const additionalRevenue = billings.reduce((sum, billing) => {
      return sum + billing.additionalCharges.reduce((chargeSum, charge) => chargeSum + charge.amount, 0);
    }, 0);

    const avgOccupancy = reservations.filter(res => res.status !== 'cancelled').length / totalRooms;

    const report = {
      year: reportYear,
      month: reportMonth,
      summary: {
        totalReservations: reservations.length,
        confirmedReservations: reservations.filter(res => res.status === 'confirmed').length,
        checkedIn: reservations.filter(res => res.status === 'checked-in').length,
        checkedOut: reservations.filter(res => res.status === 'checked-out').length,
        cancelled: reservations.filter(res => res.status === 'cancelled').length,
        noShows: reservations.filter(res => res.status === 'no-show').length,
        averageOccupancy: avgOccupancy
      },
      revenue: {
        rooms: totalRevenue,
        additional: additionalRevenue,
        total: totalRevenue + additionalRevenue
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const reservations = await Reservation.find({
      checkInDate: { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] }
    }).populate('roomId', 'type');

    const billings = await Billing.find({
      createdAt: { $gte: start, $lte: end }
    });

    const roomTypeRevenue = {};
    reservations.forEach(res => {
      const roomType = res.roomId.type;
      if (!roomTypeRevenue[roomType]) {
        roomTypeRevenue[roomType] = 0;
      }
      roomTypeRevenue[roomType] += res.totalAmount;
    });

    const additionalChargesBreakdown = {
      room_service: 0,
      restaurant: 0,
      laundry: 0,
      minibar: 0,
      other: 0
    };

    billings.forEach(billing => {
      billing.additionalCharges.forEach(charge => {
        additionalChargesBreakdown[charge.category] += charge.amount;
      });
    });

    const totalRoomRevenue = Object.values(roomTypeRevenue).reduce((sum, val) => sum + val, 0);
    const totalAdditionalRevenue = Object.values(additionalChargesBreakdown).reduce((sum, val) => sum + val, 0);

    const report = {
      period: {
        start,
        end
      },
      roomRevenue: {
        byType: roomTypeRevenue,
        total: totalRoomRevenue
      },
      additionalRevenue: {
        breakdown: additionalChargesBreakdown,
        total: totalAdditionalRevenue
      },
      totalRevenue: totalRoomRevenue + totalAdditionalRevenue
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
