import React, { useMemo, useState } from 'react';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, Mail, Phone, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';

const CheckInOut: React.FC = () => {
  const { reservations, checkIn, checkOut, loading } = useHotel();
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show'>('all');

  const filteredReservations = useMemo(() => {
    const base = reservations.slice().sort((a, b) => {
      return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
    });
    return base.filter(r => {
      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      if (!matchesStatus) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        r.customerName?.toLowerCase().includes(term) ||
        r.customerEmail?.toLowerCase().includes(term) ||
        r.roomNumber?.toLowerCase().includes(term) ||
        String(((r as any)._id || (r as any).id || '')).toLowerCase().includes(term)
      );
    });
  }, [reservations, search, statusFilter]);

  const canCheckIn = (status: string) => status === 'confirmed';
  const canCheckOut = (status: string) => status === 'checked-in';

  if (!hasRole(['admin', 'clerk', 'manager'])) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized</h2>
        <p className="text-gray-600">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-In / Check-Out</h1>
        <p className="text-gray-600">Manage today's and upcoming arrivals and departures</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest, email, room, or ID"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
        <div className="flex items-center text-sm text-gray-600">{filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''}</div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : filteredReservations.map(reservation => {
          const statusBadge = (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              reservation.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
              reservation.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
              reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {reservation.status.replace('-', ' ').toUpperCase()}
            </span>
          );

          return (
            <div key={(reservation as any)._id || (reservation as any).id || Math.random()} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-gray-900">Room {reservation.roomNumber}</div>
                  <div className="text-sm text-gray-500">
                    {(reservation as any)._id?.slice?.(-6) || (reservation as any).id?.slice?.(-6) || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {reservation.status === 'confirmed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : reservation.status === 'checked-in' ? (
                    <Clock className="h-5 w-5 text-blue-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {statusBadge}
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{reservation.customerName}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{reservation.customerEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{reservation.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {new Date(reservation.checkInDate).toLocaleDateString()} - {' '}
                    {new Date(reservation.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  disabled={!canCheckIn(reservation.status)}
                  onClick={async () => {
                    try {
                      const id = (reservation as any)._id || (reservation as any).id;
                      await checkIn(id);
                    } catch (e) {
                      alert('Failed to check in');
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded border text-sm transition-colors ${
                    canCheckIn(reservation.status)
                      ? 'border-green-300 text-green-700 hover:bg-green-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Mark Check-In
                </button>
                <button
                  disabled={!canCheckOut(reservation.status)}
                  onClick={async () => {
                    try {
                      const id = (reservation as any)._id || (reservation as any).id;
                      await checkOut(id);
                    } catch (e) {
                      alert('Failed to check out');
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded border text-sm transition-colors ${
                    canCheckOut(reservation.status)
                      ? 'border-blue-300 text-blue-700 hover:bg-blue-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Mark Check-Out
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckInOut;


