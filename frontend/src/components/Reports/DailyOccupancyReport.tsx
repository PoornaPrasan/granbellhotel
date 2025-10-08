import { useState } from 'react';
import { reportsApi } from '../../services/api';

interface DailyOccupancyData {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: string;
  noShowCount: number;
  revenue: {
    room: number;
    services: number;
    total: number;
  };
}

const DailyOccupancyReport = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<DailyOccupancyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsApi.getDailyOccupancy(selectedDate);
      setReportData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Daily Occupancy & Revenue Report</h2>

      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Date</h3>
            <p className="text-gray-700">{formatDate(reportData.date)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalRooms}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Occupied Rooms</p>
              <p className="text-2xl font-bold text-green-700">{reportData.occupiedRooms}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Vacant Rooms</p>
              <p className="text-2xl font-bold text-gray-700">{reportData.vacantRooms}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
              <p className="text-2xl font-bold text-blue-700">{reportData.occupancyRate}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Room Revenue</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(reportData.revenue.room)}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Services Revenue</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(reportData.revenue.services)}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(reportData.revenue.total)}</p>
              </div>
            </div>
          </div>

          {reportData.noShowCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No-Show Alert</h3>
              <p className="text-gray-700">
                {reportData.noShowCount} no-show(s) recorded for this date.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyOccupancyReport;
