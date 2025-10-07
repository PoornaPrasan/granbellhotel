import React, { useState, useEffect, useRef } from 'react';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, CreditCard, MapPin, Phone, Mail, User } from 'lucide-react';
import { roomsApi, ApiError } from '../../services/api';

interface ReservationFormProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onClose, onSubmit }) => {
  const { addReservation, getAvailableRooms } = useHotel();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customerName: user?.role === 'customer' ? user.name : '',
    customerEmail: user?.role === 'customer' ? user.email : '',
    customerPhone: user?.role === 'customer' ? user.phone || '' : '',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    roomType: '',
    paymentMethod: 'pending' as 'pending' | 'credit_card' | 'cash',
    cardNumber: '',
    cardExpMonth: '',
    cardExpYear: '',
    cardCvc: '',
    specialRequests: '',
    isCompanyBooking: user?.role === 'travel_company',
  });
  
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const selectedRoomRef = useRef<string>('');

  // Debug: Monitor selectedRoom state changes
  useEffect(() => {
    console.log('selectedRoom state changed to:', selectedRoom);
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const roomTypes = [
    { value: 'standard', label: 'Standard Room', basePrice: 150 },
    { value: 'deluxe', label: 'Deluxe Room', basePrice: 220 },
    { value: 'suite', label: 'Suite', basePrice: 350 },
    { value: 'residential', label: 'Residential Suite', basePrice: 500 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const searchAvailableRooms = async () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkIn >= checkOut) {
        alert('Check-out date must be after check-in date');
        return;
      }
      
      try {
        setLoading(true);
        // Reset selected room when searching for new rooms
        setSelectedRoom('');
        selectedRoomRef.current = '';
        
        console.log('Searching for available rooms:', {
          checkIn: formData.checkInDate,
          checkOut: formData.checkOutDate,
          roomType: formData.roomType
        });
        
        const response = await roomsApi.getAvailable(
          formData.checkInDate,
          formData.checkOutDate,
          formData.roomType || undefined
        );
        
        console.log('Available rooms response:', response);
        setAvailableRooms(response.data || []);
        
        if (response.data && response.data.length === 0) {
          alert('No rooms available for the selected dates. Please try different dates.');
        }
      } catch (error) {
        console.error('Failed to search available rooms:', error);
        if (error instanceof ApiError) {
          alert(`Failed to search for available rooms: ${error.message}`);
        } else {
          alert('Failed to search for available rooms. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please select both check-in and check-out dates');
    }
  };

  // Force single room selection - this ensures only one room can be selected
  const forceSingleSelection = (roomId: string) => {
    const normalizedRoomId = String(roomId);
    console.log('Forcing single selection for room:', normalizedRoomId);
    
    // Immediately update the ref
    selectedRoomRef.current = normalizedRoomId;
    
    // Update the state
    setSelectedRoom(normalizedRoomId);
  };

  const handleRoomSelection = (roomId: string) => {
    // Ensure only one room can be selected at a time
    const normalizedRoomId = String(roomId);
    
    console.log('=== ROOM SELECTION DEBUG ===');
    console.log('Current selectedRoom state:', selectedRoom);
    console.log('Current selectedRoom ref:', selectedRoomRef.current);
    console.log('Clicked room ID:', normalizedRoomId);
    console.log('State comparison:', selectedRoom === normalizedRoomId);
    console.log('Ref comparison:', selectedRoomRef.current === normalizedRoomId);
    
    // Use functional update to ensure we get the latest state
    setSelectedRoom(prevSelected => {
      console.log('Previous selected room in setState:', prevSelected);
      
      // If clicking the same room, deselect it
      if (prevSelected === normalizedRoomId) {
        console.log('Deselecting room:', normalizedRoomId);
        return '';
      } else {
        console.log('Selecting room:', normalizedRoomId);
        return normalizedRoomId;
      }
    });
    
    console.log('=== END DEBUG ===');
  };

  const calculateTotal = () => {
    if (!selectedRoom || !formData.checkInDate || !formData.checkOutDate) return 0;
    
    const room = availableRooms.find(r => (r._id || r.id) === selectedRoom);
    if (!room) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    let total = room.price * nights;
    
    // Apply company discount
    if (formData.isCompanyBooking) {
      // Assuming 15% discount for travel companies
      total *= 0.85;
    }
    
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }
    
    setLoading(true);
    
    try {
      const room = availableRooms.find(r => (r._id || r.id) === selectedRoom);
      if (!room) {
        alert('Selected room not found. Please search for rooms again.');
        return;
      }
      
      const total = calculateTotal();
      
      const reservationData = {
        customerId: user?.id || 'guest',
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        roomId: selectedRoom,
        roomNumber: room.number,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        guests: formData.guests,
        status: 'confirmed' as const,
        totalAmount: total,
        depositAmount: formData.paymentMethod === 'credit_card' ? total * 0.5 : 0,
        paymentMethod: formData.paymentMethod,
        cardDetails: formData.paymentMethod === 'credit_card' ? {
          last4: formData.cardNumber.slice(-4),
          expMonth: parseInt(formData.cardExpMonth),
          expYear: parseInt(formData.cardExpYear),
        } : undefined,
        specialRequests: formData.specialRequests,
        isCompanyBooking: formData.isCompanyBooking,
        discount: formData.isCompanyBooking ? 15 : undefined,
      };
      
      console.log('Creating reservation with data:', reservationData);
      console.log('Current user:', user);
      console.log('User authentication status:', user ? 'Authenticated' : 'Not authenticated');
      console.log('Token in localStorage:', localStorage.getItem('hotel_token') ? 'Present' : 'Missing');
      
      await addReservation(reservationData);
      
      alert('Reservation created successfully!');
      if (onSubmit) onSubmit();
      onClose();
    } catch (error) {
      console.error('Reservation creation error:', error);
      if (error instanceof ApiError) {
        alert(`Failed to create reservation: ${error.message}`);
      } else {
        alert(`Failed to create reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">New Reservation</h2>
          <p className="text-blue-100">Create a new hotel reservation</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guest Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Guest Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Number of Guests
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                max="6"
                value={formData.guests}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Dates and Room Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-in Date
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-out Date
              </label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleInputChange}
                min={formData.checkInDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Room Type (Optional)
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Type</option>
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} (${type.basePrice}/night)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Available Rooms */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={searchAvailableRooms}
              disabled={loading || !formData.checkInDate || !formData.checkOutDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search Available Rooms</span>
              )}
            </button>
          </div>

          {/* Available Rooms */}
          {availableRooms.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Available Rooms</h3>
                {selectedRoom && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoom('')}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              
              {selectedRoom && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ Room {availableRooms.find(r => (r._id || r.id) === selectedRoom)?.number} selected
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms.map(room => {
                  // Use _id instead of id since that's what MongoDB returns
                  const roomIdStr = String(room._id || room.id);
                  const isSelected = selectedRoom === roomIdStr;
                  const isSelectedByRef = selectedRoomRef.current === roomIdStr;
                  
                  console.log(`Room ${room.number} (ID: ${roomIdStr}):`);
                  console.log(`  - Room._id: ${room._id}`);
                  console.log(`  - Room.id: ${room.id}`);
                  console.log(`  - State selected: ${isSelected}`);
                  console.log(`  - Ref selected: ${isSelectedByRef}`);
                  console.log(`  - Current selectedRoom: ${selectedRoom}`);
                  console.log(`  - Current ref: ${selectedRoomRef.current}`);
                  
                  return (
                    <div
                      key={room._id || room.id}
                      onClick={() => {
                        console.log(`Clicked room ${room.number} (${roomIdStr})`);
                        forceSingleSelection(room._id || room.id);
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">Room {room.number}</h4>
                        <div className="flex items-center space-x-2">
                          {isSelected && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-lg font-bold text-green-600">
                            ${room.price}/night
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 capitalize mb-1">{room.type} Room</p>
                      <p className="text-sm text-gray-600">Capacity: {room.capacity} guests</p>
                      <p className="text-sm text-gray-600">Floor: {room.floor}</p>
                      {isSelected && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          ✓ SELECTED
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline h-4 w-4 mr-1" />
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Reserve without Payment (Auto-cancel at 7 PM)</option>
              <option value="credit_card">Credit Card (50% Deposit)</option>
              <option value="cash">Pay at Check-in</option>
            </select>
          </div>

          {/* Credit Card Details */}
          {formData.paymentMethod === 'credit_card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    name="cardExpMonth"
                    value={formData.cardExpMonth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    name="cardExpYear"
                    value={formData.cardExpYear}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={2025 + i}>{2025 + i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input
                    type="text"
                    name="cardCvc"
                    value={formData.cardCvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Late check-in, extra towels, etc."
            />
          </div>

          {/* Total Amount */}
          {selectedRoom && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">
                  ${calculateTotal().toLocaleString()}
                  {formData.isCompanyBooking && (
                    <span className="text-sm text-green-600 ml-2">(15% Company Discount Applied)</span>
                  )}
                </span>
              </div>
              {formData.paymentMethod === 'credit_card' && (
                <p className="text-sm text-gray-600 mt-1">
                  Deposit Required: ${(calculateTotal() * 0.5).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Room Selection Warning */}
          {availableRooms.length > 0 && !selectedRoom && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Please select a room to continue with your reservation.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;