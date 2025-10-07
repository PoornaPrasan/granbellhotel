import React, { useState } from 'react';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import ReservationForm from './ReservationForm';
import { 
  Plus, 
  Calendar, 
  Users, 
  Phone, 
  Mail,
  CreditCard,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const ReservationList: React.FC = () => {
  const { reservations, cancelReservation, updateReservation } = useHotel();
  const { deleteReservation } = useHotel() as any;
  const { user, hasRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editGuests, setEditGuests] = useState<number>(1);
  const [editRequests, setEditRequests] = useState('');
  const [editStatus, setEditStatus] = useState<string>('confirmed');

  // Helper to normalize customerId from API (string or populated object)
  const getCustomerId = (res: any): string | undefined => {
    const cid = (res as any).customerId;
    if (typeof cid === 'string') return cid;
    if (cid && typeof cid === 'object') return (cid as any)._id || (cid as any).id;
    return (res as any).customer_id;
  };

  // Filter reservations based on user role
  const getReservationsForUser = () => {
    let filteredReservations = reservations;

    // Filter by user role
    if (user?.role === 'customer') {
      const currentUserId = (user as any)?.id || (user as any)?._id;
      filteredReservations = filteredReservations.filter(res => getCustomerId(res) === currentUserId);
    } else if (user?.role === 'travel_company') {
      filteredReservations = filteredReservations.filter(res => res.isCompanyBooking);
    }

    // Filter by status
    if (filter !== 'all') {
      filteredReservations = filteredReservations.filter(res => res.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filteredReservations = filteredReservations.filter(res =>
        res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredReservations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'checked-in':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'checked-out':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'no-show':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canModifyReservation = (reservation: any) => {
    if (hasRole(['admin', 'clerk'])) return true;
    if (user?.role === 'customer') {
      const currentUserId = (user as any)?.id || (user as any)?._id;
      if (getCustomerId(reservation) === currentUserId) {
        return reservation.status === 'confirmed';
      }
    }
    if (user?.role === 'travel_company' && reservation.isCompanyBooking) {
      return reservation.status === 'confirmed';
    }
    return false;
  };

  const handleCancelReservation = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservation(id);
    }
  };

  const filteredReservations = getReservationsForUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage hotel reservations and bookings</p>
        </div>
        
        {hasRole(['admin', 'clerk', 'customer', 'travel_company']) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Reservation</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by guest name, room number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReservations.map(reservation => (
          <div
            key={(reservation as any)._id || (reservation as any).id || Math.random()}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(reservation.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                  {reservation.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">Room {reservation.roomNumber}</p>
                <p className="text-sm text-gray-500">#{(reservation as any)._id?.slice(-6) || (reservation as any).id?.slice(-6) || 'N/A'}</p>
              </div>
            </div>

            {/* Guest Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{reservation.customerName}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{reservation.customerEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{reservation.customerPhone}</span>
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {new Date(reservation.checkInDate).toLocaleDateString()} - {' '}
                  {new Date(reservation.checkOutDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{reservation.guests} guest{reservation.guests !== 1 ? 's' : ''}</span>
              </div>
              {reservation.paymentMethod !== 'pending' && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">{reservation.paymentMethod.replace('_', ' ')}</span>
                  {reservation.cardDetails && (
                    <span>ending in {reservation.cardDetails.last4}</span>
                  )}
                </div>
              )}
            </div>

            {/* Company Booking Badge */}
            {reservation.isCompanyBooking && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <MapPin className="h-3 w-3 mr-1" />
                  Company Booking
                  {reservation.discount && ` (${reservation.discount}% discount)`}
                </span>
              </div>
            )}

            {/* Special Requests */}
            {reservation.specialRequests && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Special Requests:</span> {reservation.specialRequests}
                </p>
              </div>
            )}

            {/* Amount */}
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-green-600">
                ${reservation.totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            {canModifyReservation(reservation) && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEditingReservation(reservation);
                    setEditCheckIn(new Date(reservation.checkInDate).toISOString().slice(0,10));
                    setEditCheckOut(new Date(reservation.checkOutDate).toISOString().slice(0,10));
                    setEditGuests(reservation.guests || 1);
                    setEditRequests(reservation.specialRequests || '');
                    setEditStatus(reservation.status || 'confirmed');
                    setIsEditOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleCancelReservation((reservation as any)._id || (reservation as any).id || '')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            {/* Delete button visible when cancelled and user is owner */}
            {reservation.status === 'cancelled' && (() => {
              const currentUserId = (user as any)?.id || (user as any)?._id;
              const cid = getCustomerId(reservation);
              return cid === currentUserId;
            })() && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={async () => {
                    if (window.confirm('This will permanently delete the reservation. Continue?')) {
                      try {
                        const id = (reservation as any)._id || (reservation as any).id;
                        await (deleteReservation as any)(id);
                      } catch (e) {
                        alert('Failed to delete reservation');
                      }
                    }
                  }}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                >
                  Delete Reservation
                </button>
              </div>
            )}

            {/* Created Date */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Created: {new Date(reservation.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reservations Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filter !== 'all'
              ? 'No reservations match your current filters.'
              : 'Get started by creating your first reservation.'}
          </p>
          {hasRole(['admin', 'clerk', 'customer', 'travel_company']) && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Reservation</span>
            </button>
          )}
        </div>
      )}

      {/* Reservation Form Modal */}
      {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSubmit={() => {
            setShowForm(false);
            // Refresh data if needed
          }}
        />
      )}

      {/* Edit Reservation Modal */}
      {isEditOpen && editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setIsEditOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Reservation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={editCheckIn}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Guests</label>
                <input
                  type="number"
                  min={1}
                  value={editGuests}
                  onChange={(e) => setEditGuests(parseInt(e.target.value || '1', 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Special Requests</label>
                <textarea
                  value={editRequests}
                  onChange={(e) => setEditRequests(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={3}
                />
              </div>
              {/* Admin/Staff can update status, including No Show */}
              {hasRole(['admin','manager','clerk']) && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editCheckIn || !editCheckOut) {
                    alert('Please select both dates');
                    return;
                  }
                  const ci = new Date(editCheckIn);
                  const co = new Date(editCheckOut);
                  if (ci >= co) {
                    alert('Check-out must be after check-in');
                    return;
                  }
                  try {
                    const id = (editingReservation as any)._id || (editingReservation as any).id;
                    const payload: any = {
                      checkInDate: ci,
                      checkOutDate: co,
                      guests: editGuests,
                      specialRequests: editRequests,
                    };
                    if (hasRole(['admin','manager','clerk'])) {
                      payload.status = editStatus;
                    }
                    await updateReservation(id, payload);
                    setIsEditOpen(false);
                  } catch (e) {
                    alert('Failed to update reservation');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;