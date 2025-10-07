import React, { useEffect, useState } from 'react';
import { usersApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, Mail, Phone, Calendar as CalendarIcon, Shield, Edit, Trash2 } from 'lucide-react';

interface GuestUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

const GuestsManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const [guests, setGuests] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingGuest, setEditingGuest] = useState<GuestUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Only admins should access this page
  if (!hasRole(['admin'])) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can view guest accounts.</p>
      </div>
    );
  }

  useEffect(() => {
    const loadGuests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.getAll();
        const allUsers: GuestUser[] = response.data || [];
        const onlyCustomers = allUsers.filter(u => (u as any).role === 'customer');
        // Normalize id
        setGuests(onlyCustomers.map(u => ({ ...u, id: u.id || (u as any)._id })));
      } catch (e: any) {
        setError(e?.message || 'Failed to load guests');
      } finally {
        setLoading(false);
      }
    };
    loadGuests();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading guests...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Guests</h1>
        <p className="text-gray-600">Showing customers only</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">All Guests ({guests.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map(guest => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.name || '—'}</div>
                        <div className="text-xs text-gray-500">#{String(guest.id || guest._id || '').slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-400" />{guest.email || '—'}</div>
                      <div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-400" />{guest.phone || '—'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingGuest(guest);
                          setEditName(guest.name || '');
                          setEditEmail(guest.email || '');
                          setEditPhone(guest.phone || '');
                          setSuccess(null);
                          setError(null);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit guest"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!guest.id) return;
                          if (!confirm('Delete this guest? This action cannot be undone.')) return;
                          try {
                            setDeletingId(guest.id);
                            await usersApi.delete(guest.id);
                            setGuests(prev => prev.filter(g => g.id !== guest.id));
                            setSuccess('Guest deleted successfully');
                          } catch (e: any) {
                            setError(e?.message || 'Failed to delete guest');
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete guest"
                        disabled={deletingId === guest.id}
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

      {editingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">Edit Guest</h2>
              <p className="text-blue-100 text-sm">Update guest details</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setEditingGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingGuest?.id) return;
                  try {
                    setSaving(true);
                    setError(null);
                    setSuccess(null);
                    const payload: any = { name: editName, email: editEmail, phone: editPhone };
                    await usersApi.update(editingGuest.id, payload);
                    setGuests(prev => prev.map(g => g.id === editingGuest.id ? { ...g, ...payload } : g));
                    setSuccess('Guest updated successfully');
                    setEditingGuest(null);
                  } catch (e: any) {
                    setError(e?.message || 'Failed to update guest');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

export default GuestsManagement;


