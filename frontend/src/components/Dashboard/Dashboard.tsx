import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../contexts/HotelContext';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { rooms, reservations, reports } = useHotel();

  // Calculate statistics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  const todayReservations = reservations.filter(res => {
    const today = new Date();
    const checkIn = new Date(res.checkInDate);
    return checkIn.toDateString() === today.toDateString();
  });

  const checkInsToday = reservations.filter(res => {
    const today = new Date();
    const checkIn = new Date(res.checkInDate);
    return checkIn.toDateString() === today.toDateString() && res.status === 'confirmed';
  });

  const checkOutsToday = reservations.filter(res => {
    const today = new Date();
    const checkOut = new Date(res.checkOutDate);
    return checkOut.toDateString() === today.toDateString() && res.status === 'checked-in';
  });

  const todayReport = reports.find(report => 
    report.date.toDateString() === new Date().toDateString()
  );

  const stats = [
    {
      title: 'Total Rooms',
      value: totalRooms,
      icon: Building2,
      color: 'bg-blue-500',
      change: null,
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+2.5%',
    },
    {
      title: 'Check-ins Today',
      value: checkInsToday.length,
      icon: CheckCircle,
      color: 'bg-yellow-500',
      change: null,
    },
    {
      title: 'Check-outs Today',
      value: checkOutsToday.length,
      icon: Clock,
      color: 'bg-purple-500',
      change: null,
    },
  ];

  if (user?.role === 'manager' || user?.role === 'admin') {
    stats.push({
      title: 'Today\'s Revenue',
      value: `$${todayReport ? Math.round(todayReport.revenue.total).toLocaleString() : '0'}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+8.2%',
    });
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDashboard = () => {
    // Debug: Log user and reservations data
    console.log('Dashboard - Current user:', user);
    console.log('Dashboard - All reservations:', reservations);
    console.log('Dashboard - User reservations:', reservations.filter(res => res.customerId === user?.id));
    
    switch (user?.role) {
      case 'customer':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Reservations</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {`${reservations.length} reservation${reservations.length !== 1 ? 's' : ''}`}
                  </span>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {reservations.length > 0 ? (
                  reservations.map(reservation => (
                    <div key={(reservation as any)._id || (reservation as any).id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">Room {reservation.roomNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(reservation.checkInDate).toLocaleDateString()} - {' '}
                            {new Date(reservation.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ${reservation.totalAmount?.toLocaleString()} • {reservation.guests} guest{reservation.guests > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                          reservation.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                          reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Reservation #{((reservation as any)._id || (reservation as any).id || '').slice(-6)}</span>
                        <span>{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No reservations found</p>
                    <p className="text-sm text-gray-400">Start by making your first reservation!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.hash = '#reservations'}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">View All Reservations</div>
                  <div className="text-sm text-gray-500">See all your bookings</div>
                </button>
                <button 
                  onClick={() => window.location.hash = '#reservations'}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">Make New Reservation</div>
                  <div className="text-sm text-gray-500">Book your next stay</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-800">View Bills</div>
                  <div className="text-sm text-gray-500">Check payment status</div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'travel_company':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Bookings</h3>
              <div className="space-y-4">
                {reservations.filter(res => res.isCompanyBooking).length > 0 ? (
                  reservations.filter(res => res.isCompanyBooking).map(reservation => (
                    <div key={(reservation as any)._id || (reservation as any).id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">Room {reservation.roomNumber}</p>
                          <p className="text-sm text-gray-500">{reservation.customerName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(reservation.checkInDate).toLocaleDateString()} - {' '}
                            {new Date(reservation.checkOutDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ${reservation.totalAmount?.toLocaleString()} • {reservation.guests} guest{reservation.guests > 1 ? 's' : ''}
                          </p>
                          {reservation.discount && (
                            <p className="text-sm text-green-600">Company Discount: {reservation.discount}%</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                          reservation.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                          reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Booking #{((reservation as any)._id || (reservation as any).id || '').slice(-6)}</span>
                        <span>{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No company bookings found</p>
                    <p className="text-sm text-gray-400">Start by making your first booking!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bulk Booking Benefits</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="font-medium text-green-800">3+ Rooms: 10% Discount</div>
                  <div className="text-sm text-green-600">Perfect for small groups</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-medium text-blue-800">5+ Rooms: 15% Discount</div>
                  <div className="text-sm text-blue-600">Great for corporate events</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="font-medium text-purple-800">10+ Rooms: 20% Discount</div>
                  <div className="text-sm text-purple-600">Maximum savings for large groups</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">{checkInsToday.length} Check-ins Expected</p>
                    <p className="text-sm text-gray-500">Rooms ready for new guests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">{checkOutsToday.length} Check-outs Due</p>
                    <p className="text-sm text-gray-500">Rooms to be cleaned and prepared</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-800">2 Maintenance Tasks</p>
                    <p className="text-sm text-gray-500">Room 105 AC repair, Room 203 TV</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Status Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {rooms.filter(r => r.status === 'available').length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {rooms.filter(r => r.status === 'occupied').length}
                  </div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {rooms.filter(r => r.status === 'reserved').length}
                  </div>
                  <div className="text-sm text-gray-600">Reserved</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {rooms.filter(r => r.status === 'maintenance').length}
                  </div>
                  <div className="text-sm text-gray-600">Maintenance</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Welcome to your hotel management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-specific Dashboard Content */}
      {getRoleDashboard()}
    </div>
  );
};

export default Dashboard;