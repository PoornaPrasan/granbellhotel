const Billing = require('../models/Billing');
const Reservation = require('../models/Reservation');

exports.getAllBillings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    }

    const billings = await Billing.find(query)
      .populate('reservationId', 'roomNumber checkInDate checkOutDate')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: billings.length,
      data: billings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBilling = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('reservationId')
      .populate('customerId', 'name email phone');

    if (!billing) {
      return res.status(404).json({ message: 'Billing not found' });
    }

    if (req.user.role === 'customer' && billing.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this billing' });
    }

    res.json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createBilling = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.body.reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const existingBilling = await Billing.findOne({ reservationId: req.body.reservationId });

    if (existingBilling) {
      return res.status(400).json({ message: 'Billing already exists for this reservation' });
    }

    const billingData = {
      ...req.body,
      customerId: reservation.customerId
    };

    const billing = await Billing.create(billingData);

    res.status(201).json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create billing', error: error.message });
  }
};

exports.updateBilling = async (req, res) => {
  try {
    let billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({ message: 'Billing not found' });
    }

    billing = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update billing', error: error.message });
  }
};

exports.addCharge = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({ message: 'Billing not found' });
    }

    billing.additionalCharges.push(req.body);
    await billing.save();

    res.json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add charge', error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({ message: 'Billing not found' });
    }

    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    billing.paidAmount += amount;
    if (paymentMethod) {
      billing.paymentMethod = paymentMethod;
    }

    await billing.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: billing
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to process payment', error: error.message });
  }
};

exports.getBillingByReservation = async (req, res) => {
  try {
    const billing = await Billing.findOne({ reservationId: req.params.reservationId })
      .populate('reservationId')
      .populate('customerId', 'name email phone');

    if (!billing) {
      return res.status(404).json({ message: 'Billing not found for this reservation' });
    }

    if (req.user.role === 'customer' && billing.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this billing' });
    }

    res.json({
      success: true,
      data: billing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
