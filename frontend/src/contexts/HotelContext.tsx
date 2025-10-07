import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Reservation, Billing, Report } from '../types';
import { roomsApi, reservationsApi, billingApi, reportsApi, ApiError } from '../services/api';

interface HotelContextType {
  rooms: Room[];
  reservations: Reservation[];
  billings: Billing[];
  reports: Report[];
  loading: boolean;
  // Room operations
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  // Reservation operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  deleteReservation?: (id: string) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  // Billing operations
  addBilling: (billing: Omit<Billing, 'id' | 'createdAt'>) => void;
  updateBilling: (id: string, billing: Partial<Billing>) => void;
  // Utility functions
  getAvailableRooms: (checkIn: Date, checkOut: Date) => Room[];
  getDailyReport: (date: Date) => Report | undefined;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

// Mock data for demo
const mockRooms: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'standard',
    capacity: 2,
    price: 150,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
    status: 'available',
    floor: 1,
  },
  {
    id: '2',
    number: '102',
    type: 'deluxe',
    capacity: 3,
    price: 220,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service'],
    status: 'available',
    floor: 1,
  },
  {
    id: '3',
    number: '201',
    type: 'suite',
    capacity: 4,
    price: 350,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Kitchenette'],
    status: 'occupied',
    floor: 2,
  },
  {
    id: '4',
    number: '301',
    type: 'residential',
    capacity: 6,
    price: 500,
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Room Service', 'Full Kitchen', 'Living Room'],
    status: 'available',
    floor: 3,
  },
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    customerId: '4',
    customerName: 'John Customer',
    customerEmail: 'customer@example.com',
    customerPhone: '+1-555-0004',
    roomId: '3',
    roomNumber: '201',
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    guests: 2,
    status: 'checked-in',
    totalAmount: 1050,
    depositAmount: 350,
    paymentMethod: 'credit_card',
    cardDetails: {
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
    },
    specialRequests: 'Late check-out requested',
    isCompanyBooking: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [roomsResponse, reservationsResponse, billingsResponse] = await Promise.all([
        roomsApi.getAll(),
        reservationsApi.getAll(),
        billingApi.getAll(),
      ]);
      
      setRooms(roomsResponse.data || []);
      setReservations(reservationsResponse.data || []);
      setBillings(billingsResponse.data || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Fallback to empty arrays if API fails
      setRooms([]);
      setReservations([]);
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };

  // Room operations
  const addRoom = async (room: Omit<Room, 'id'>) => {
    try {
      const response = await roomsApi.create(room);
      setRooms(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add room:', error);
      throw error;
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    try {
      const response = await roomsApi.update(id, roomData);
      setRooms(prev => prev.map(room => 
        room.id === id ? response.data : room
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to update room:', error);
      throw error;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await roomsApi.delete(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (error) {
      console.error('Failed to delete room:', error);
      throw error;
    }
  };

  // Reservation operations
  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await reservationsApi.create(reservationData);
      setReservations(prev => [...prev, response.data]);
      
      // Note: Room status update should be handled by the backend
      // when creating a reservation, not by the frontend
      
      return response.data;
    } catch (error) {
      console.error('Failed to add reservation:', error);
      throw error;
    }
  };

  const updateReservation = async (id: string, reservationData: Partial<Reservation>) => {
    try {
      const response = await reservationsApi.update(id, reservationData);
      setReservations(prev => prev.map(reservation =>
        (((reservation as any)._id || reservation.id) === id) ? response.data : reservation
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to update reservation:', error);
      throw error;
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const reservation = reservations.find(r => (((r as any)._id || r.id) === id));
      if (!reservation) throw new Error('Reservation not found');
      
      const response = await reservationsApi.cancel(id);
      setReservations(prev => prev.map(r => 
        (((r as any)._id || r.id) === id) ? response.data : r
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      throw error;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      await reservationsApi.delete(id);
      setReservations(prev => prev.filter(r => (((r as any)._id || r.id) !== id)));
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      throw error;
    }
  };

  const checkIn = async (id: string) => {
    try {
      const reservation = reservations.find(r => (((r as any)._id || r.id) === id));
      if (!reservation) throw new Error('Reservation not found');
      
      const response = await reservationsApi.checkIn(id);
      setReservations(prev => prev.map(r => 
        (((r as any)._id || r.id) === id) ? response.data : r
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to check in:', error);
      throw error;
    }
  };

  const checkOut = async (id: string) => {
    try {
      const reservation = reservations.find(r => (((r as any)._id || r.id) === id));
      if (!reservation) throw new Error('Reservation not found');
      
      const response = await reservationsApi.checkOut(id);
      setReservations(prev => prev.map(r => 
        (((r as any)._id || r.id) === id) ? response.data : r
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to check out:', error);
      throw error;
    }
  };

  // Billing operations
  const addBilling = async (billingData: Omit<Billing, 'id' | 'createdAt'>) => {
    try {
      const response = await billingApi.create(billingData);
      setBillings(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add billing:', error);
      throw error;
    }
  };

  const updateBilling = async (id: string, billingData: Partial<Billing>) => {
    try {
      const response = await billingApi.update(id, billingData);
      setBillings(prev => prev.map(billing =>
        billing.id === id ? response.data : billing
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to update billing:', error);
      throw error;
    }
  };

  // Utility functions
  const getAvailableRooms = (checkIn: Date, checkOut: Date): Room[] => {
    return rooms.filter(room => {
      if (room.status === 'maintenance') return false;
      
      // Check if room has conflicting reservations
      const hasConflict = reservations.some(reservation => {
        if (reservation.roomId !== room.id) return false;
        if (reservation.status === 'cancelled') return false;
        
        const resCheckIn = new Date(reservation.checkInDate);
        const resCheckOut = new Date(reservation.checkOutDate);
        
        return (
          (checkIn >= resCheckIn && checkIn < resCheckOut) ||
          (checkOut > resCheckIn && checkOut <= resCheckOut) ||
          (checkIn <= resCheckIn && checkOut >= resCheckOut)
        );
      });
      
      return !hasConflict;
    });
  };

  const getDailyReport = (date: Date): Report | undefined => {
    return reports.find(report => 
      report.date.toDateString() === date.toDateString()
    );
  };

  // Generate sample reports
  useEffect(() => {
    const generateReports = () => {
      const today = new Date();
      const sampleReports: Report[] = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const occupiedRooms = Math.floor(Math.random() * rooms.length);
        const revenue = occupiedRooms * (150 + Math.random() * 200);
        
        sampleReports.push({
          date,
          occupancy: {
            total: rooms.length,
            occupied: occupiedRooms,
            percentage: (occupiedRooms / rooms.length) * 100,
          },
          revenue: {
            rooms: revenue,
            additional: Math.random() * 500,
            total: revenue + Math.random() * 500,
          },
          reservations: {
            new: Math.floor(Math.random() * 10),
            checkedIn: Math.floor(Math.random() * 8),
            checkedOut: Math.floor(Math.random() * 8),
            cancelled: Math.floor(Math.random() * 3),
            noShows: Math.floor(Math.random() * 2),
          },
        });
      }
      
      setReports(sampleReports);
    };
    
    generateReports();
  }, [rooms.length]);

  return (
    <HotelContext.Provider
      value={{
        rooms,
        reservations,
        billings,
        reports,
        loading,
        addRoom,
        updateRoom,
        deleteRoom,
        addReservation,
        updateReservation,
        cancelReservation,
        deleteReservation,
        checkIn,
        checkOut,
        addBilling,
        updateBilling,
        getAvailableRooms,
        getDailyReport,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};