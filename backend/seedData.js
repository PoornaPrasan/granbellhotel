const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const users = [
  {
    name: 'System Administrator',
    email: 'admin@granbell.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0001'
  },
  {
    name: 'Hotel Manager',
    email: 'manager@granbell.com',
    password: 'manager123',
    role: 'manager',
    phone: '+1-555-0002'
  },
  {
    name: 'Front Desk Clerk',
    email: 'clerk@granbell.com',
    password: 'clerk123',
    role: 'clerk',
    phone: '+1-555-0003'
  },
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1-555-0004'
  },
  {
    name: 'Travel Partners Inc.',
    email: 'travel@company.com',
    password: 'travel123',
    role: 'travel_company',
    phone: '+1-555-0005',
    companyName: 'Travel Partners Inc.'
  }
];

const rooms = [
  {
    number: '101',
    type: 'standard',
    capacity: 2,
    price: 150,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
    status: 'available',
    floor: 1
  },
  {
    number: '102',
    type: 'deluxe',
    capacity: 3,
    price: 220,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service'],
    status: 'available',
    floor: 1
  },
  {
    number: '103',
    type: 'standard',
    capacity: 2,
    price: 150,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
    status: 'available',
    floor: 1
  },
  {
    number: '201',
    type: 'suite',
    capacity: 4,
    price: 350,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Kitchenette'],
    status: 'available',
    floor: 2
  },
  {
    number: '202',
    type: 'deluxe',
    capacity: 3,
    price: 220,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service'],
    status: 'available',
    floor: 2
  },
  {
    number: '203',
    type: 'suite',
    capacity: 4,
    price: 350,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Kitchenette'],
    status: 'available',
    floor: 2
  },
  {
    number: '301',
    type: 'residential',
    capacity: 6,
    price: 500,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Full Kitchen', 'Living Room'],
    status: 'available',
    floor: 3
  },
  {
    number: '302',
    type: 'residential',
    capacity: 6,
    price: 500,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Full Kitchen', 'Living Room'],
    status: 'available',
    floor: 3
  }
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Room.deleteMany();
    await Reservation.deleteMany();

    console.log('Data Destroyed');

    const createdUsers = await User.create(users);
    console.log('Users Created');

    const createdRooms = await Room.create(rooms);
    console.log('Rooms Created');

    const customerUser = createdUsers.find(u => u.role === 'customer');
    const sampleRoom = createdRooms[3];

    if (customerUser && sampleRoom) {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 1);
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 4);

      const sampleReservation = {
        customerId: customerUser._id,
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        customerPhone: customerUser.phone,
        roomId: sampleRoom._id,
        roomNumber: sampleRoom.number,
        checkInDate,
        checkOutDate,
        guests: 2,
        status: 'confirmed',
        totalAmount: sampleRoom.price * 3,
        depositAmount: sampleRoom.price * 3 * 0.5,
        paymentMethod: 'credit_card',
        cardDetails: {
          last4: '4242',
          expMonth: 12,
          expYear: 2025
        },
        specialRequests: 'Late check-out requested',
        isCompanyBooking: false,
        discount: 0
      };

      await Reservation.create(sampleReservation);
      await Room.findByIdAndUpdate(sampleRoom._id, { status: 'reserved' });
      console.log('Sample Reservation Created');
    }

    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Room.deleteMany();
    await Reservation.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
