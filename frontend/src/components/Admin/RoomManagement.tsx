import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  DollarSign, 
  Wifi, 
  Tv, 
  Car, 
  Coffee,
  Bed,
  Bath,
  Calendar,
  MapPin
} from 'lucide-react';
import { roomsApi, ApiError } from '../../services/api';
import BulkRoomCreation from './BulkRoomCreation';

interface RoomManagementProps {}

interface RoomData {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite' | 'residential';
  capacity: number;
  price: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: number;
  createdAt: string;
  updatedAt: string;
}

const RoomManagement: React.FC<RoomManagementProps> = () => {
  const { hasRole } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    number: '',
    type: 'standard' as 'standard' | 'deluxe' | 'suite' | 'residential',
    capacity: 2,
    price: 150,
    amenities: [] as string[],
    status: 'available' as 'available' | 'occupied' | 'maintenance' | 'reserved',
    floor: 1,
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard Room', basePrice: 150, description: 'Comfortable room with basic amenities' },
    { value: 'deluxe', label: 'Deluxe Room', basePrice: 220, description: 'Spacious room with premium amenities' },
    { value: 'suite', label: 'Suite', basePrice: 350, description: 'Luxury suite with separate living area' },
    { value: 'residential', label: 'Residential Suite', basePrice: 500, description: 'Full apartment-style accommodation' },
  ];

  const availableAmenities = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'ac', label: 'Air Conditioning', icon: Car },
    { id: 'mini_bar', label: 'Mini Bar', icon: Coffee },
    { id: 'balcony', label: 'Balcony', icon: MapPin },
    { id: 'room_service', label: 'Room Service', icon: Coffee },
    { id: 'kitchenette', label: 'Kitchenette', icon: Coffee },
    { id: 'full_kitchen', label: 'Full Kitchen', icon: Coffee },
    { id: 'living_room', label: 'Living Room', icon: Bed },
    { id: 'jacuzzi', label: 'Jacuzzi', icon: Bath },
    { id: 'gym_access', label: 'Gym Access', icon: Users },
    { id: 'pool_access', label: 'Pool Access', icon: Users },
  ];

  // Check if current user has admin/manager privileges
  if (!hasRole(['admin', 'manager'])) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">You need admin or manager privileges to access room management.</p>
      </div>
    );
  }

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsApi.getAll();
      const normalized = (response.data || []).map((r: any) => ({
        ...r,
        id: r.id || r._id,
      }));
      setRooms(normalized);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleRoomTypeChange = (type: string) => {
    const roomType = roomTypes.find(rt => rt.value === type);
    setFormData(prev => ({
      ...prev,
      type: type as any,
      price: roomType?.basePrice || prev.price
    }));
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const roomData = {
        number: formData.number,
        type: formData.type,
        capacity: formData.capacity,
        price: formData.price,
        amenities: formData.amenities,
        status: formData.status,
        floor: formData.floor,
      };

      if (editingRoom) {
        // Update existing room
        const targetId = (editingRoom as any).id || (editingRoom as any)._id;
        await roomsApi.update(targetId, roomData);
        setSuccess('Room updated successfully!');
      } else {
        // Create new room
        await roomsApi.create(roomData);
        setSuccess('Room created successfully!');
      }
      
      setShowCreateForm(false);
      resetForm();
      loadRooms();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to save room');
      }
    }
  };

  const handleEditRoom = (room: RoomData) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      amenities: room.amenities,
      status: room.status,
      floor: room.floor,
    });
    setShowCreateForm(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await roomsApi.delete(roomId);
      setSuccess('Room deleted successfully!');
      loadRooms();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to delete room');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      type: 'standard',
      capacity: 2,
      price: 150,
      amenities: [],
      status: 'available',
      floor: 1,
    });
    setEditingRoom(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'standard':
        return 'bg-gray-100 text-gray-800';
      case 'deluxe':
        return 'bg-blue-100 text-blue-800';
      case 'suite':
        return 'bg-purple-100 text-purple-800';
      case 'residential':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel rooms, pricing, and amenities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkCreate(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Quick Setup (5 Rooms)</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-600 text-sm mb-6">
          {success}
        </div>
      )}

      {/* Create/Edit Room Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <p className="text-blue-100">
                {editingRoom ? 'Update room information' : 'Add a new room to the hotel'}
              </p>
            </div>
            
            <form onSubmit={handleCreateRoom} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 101, 201A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor
                  </label>
                  <input
                    type="number"
                    name="floor"
                    min="1"
                    max="50"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} (${type.basePrice}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    max="10"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map(amenity => {
                    const Icon = amenity.icon;
                    const isSelected = formData.amenities.includes(amenity.id);
                    
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Room Creation */}
      {showBulkCreate && (
        <BulkRoomCreation
          onClose={() => setShowBulkCreate(false)}
          onSuccess={() => {
            loadRooms();
            setSuccess('5 rooms created successfully!');
          }}
        />
      )}

      {/* Rooms List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">All Rooms ({rooms.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amenities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Room {room.number}</div>
                        <div className="text-sm text-gray-500">Floor {room.floor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(room.type)}`}>
                        {room.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {room.capacity} guests
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${room.price}/night
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map(amenity => (
                        <span key={amenity} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {amenity.replace('_', ' ')}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
