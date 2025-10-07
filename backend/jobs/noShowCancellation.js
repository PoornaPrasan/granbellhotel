const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

function scheduleNoShowCancellation() {
  // Runs every day at 19:00 server time
  cron.schedule('0 19 * * *', async () => {
    try {
      const now = new Date();
      // Find reservations that are still confirmed, check-in date is today or before now,
      // marked as no-show, and made with credit card 50% deposit
      const candidates = await Reservation.find({
        status: 'no-show',
        paymentMethod: 'credit_card',
        checkInDate: { $lte: now },
      });

      for (const res of candidates) {
        res.status = 'cancelled';
        await res.save();
        await Room.findByIdAndUpdate(res.roomId, { status: 'available' });
      }

      console.log(`[NoShowJob] Processed ${candidates.length} reservations at 19:00`);
    } catch (err) {
      console.error('[NoShowJob] Error processing reservations:', err.message);
    }
  });
}

module.exports = { scheduleNoShowCancellation };


