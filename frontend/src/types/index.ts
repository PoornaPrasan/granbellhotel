// Core type definitions for the hotel system
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'clerk' | 'customer' | 'travel_company';
  phone?: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite' | 'residential';
  capacity: number;
  price: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: number;
}

export interface Reservation {
  id?: string;
  _id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomId: string;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  totalAmount: number;
  depositAmount: number;
  paymentMethod: 'credit_card' | 'cash' | 'pending';
  cardDetails?: {
    last4: string;
    expMonth: number;
    expYear: number;
  };
  specialRequests?: string;
  isCompanyBooking: boolean;
  companyId?: string;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Billing {
  id: string;
  reservationId: string;
  customerId: string;
  roomCharges: number;
  additionalCharges: BillingItem[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod: 'credit_card' | 'cash';
  createdAt: Date;
}

export interface BillingItem {
  description: string;
  amount: number;
  category: 'room_service' | 'restaurant' | 'laundry' | 'minibar' | 'other';
  date: Date;
}

export interface Report {
  date: Date;
  occupancy: {
    total: number;
    occupied: number;
    percentage: number;
  };
  revenue: {
    rooms: number;
    additional: number;
    total: number;
  };
  reservations: {
    new: number;
    checkedIn: number;
    checkedOut: number;
    cancelled: number;
    noShows: number;
  };
}