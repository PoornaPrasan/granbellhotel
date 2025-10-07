import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Building2, Shield } from 'lucide-react';
import { roomsApi, ApiError } from '../../services/api';

interface BulkRoomCreationProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BulkRoomCreation: React.FC<BulkRoomCreationProps> = ({ onClose, onSuccess }) => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if current user has admin/manager privileges
  if (!hasRole(['admin', 'manager'])) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">You need admin or manager privileges to create rooms.</p>
      </div>
    );
  }

  const sampleRooms = [
    {
      number: '101',
      type: 'standard' as const,
      capacity: 2,
      price: 150,
      amenities: ['wifi', 'tv', 'ac', 'mini_bar'],
      status: 'available' as const,
      floor: 1,
    },
    {
      number: '102',
      type: 'deluxe' as const,
      capacity: 3,
      price: 220,
      amenities: ['wifi', 'tv', 'ac', 'mini_bar', 'balcony', 'room_service'],
      status: 'available' as const,
      floor: 1,
    },
    {
      number: '201',
      type: 'suite' as const,
      capacity: 4,
      price: 350,
      amenities: ['wifi', 'tv', 'ac', 'mini_bar', 'balcony', 'room_service', 'kitchenette'],
      status: 'available' as const,
      floor: 2,
    },
    {
      number: '202',
      type: 'deluxe' as const,
      capacity: 3,
      price: 220,
      amenities: ['wifi', 'tv', 'ac', 'mini_bar', 'balcony', 'room_service'],
      status: 'available' as const,
      floor: 2,
    },
    {
      number: '301',
      type: 'residential' as const,
      capacity: 6,
      price: 500,
      amenities: ['wifi', 'tv', 'ac', 'mini_bar', 'balcony', 'room_service', 'full_kitchen', 'living_room'],
      status: 'available' as const,
      floor: 3,
    },
  ];

  const handleBulkCreate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const promises = sampleRooms.map(room => roomsApi.create(room));
      await Promise.all(promises);
      
      setSuccess('All 5 rooms created successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to create rooms');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Quick Room Setup</h2>
          <p className="text-green-100">Create 5 sample rooms with different types and amenities</p>
        </div>
        
        <div className="p-6">
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

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Rooms to Create:</h3>
            <div className="space-y-3">
              {sampleRooms.map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Room {room.number}</div>
                      <div className="text-sm text-gray-600">
                        {room.type} • Floor {room.floor} • {room.capacity} guests • ${room.price}/night
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {room.amenities.length} amenities
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCreate}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create All Rooms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkRoomCreation;
