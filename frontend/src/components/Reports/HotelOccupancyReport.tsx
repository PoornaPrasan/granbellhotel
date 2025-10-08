import { useState } from 'react';
import { reportsApi } from '../../services/api';

interface OccupancyByType {
  type: string;
  totalRooms: number;
  capacity: number;
  currentBookings: number;
  pastBookings: number;
  projectedBookings: number;
  occupancyRate: string;
}

interface HotelOccupancyData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  occupancyByRoomType: OccupancyByType[];
  totalRooms: number;
  overallOccupancyRate: string;
}

const HotelOccupancyReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(nextMonth);
  const [reportData, setReportData] = useState<HotelOccupancyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await reportsApi.getHotelOccupancy(startDate, endDate);
      setReportData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hotel Occupancy Report</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Period</h3>
            <p className="text-gray-700">
              {formatDate(reportData.dateRange.startDate)} - {formatDate(reportData.dateRange.endDate)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalRooms}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Overall Occupancy Rate</p>
              <p className="text-2xl font-bold text-green-700">{reportData.overallOccupancyRate}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy by Room Type</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Total Rooms
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Past
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Projected
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Occupancy Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.occupancyByRoomType.map((roomType) => (
                    <tr key={roomType.type} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 capitalize">{roomType.type}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {roomType.totalRooms}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {roomType.currentBookings}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {roomType.pastBookings}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                        {roomType.projectedBookings}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(parseFloat(roomType.occupancyRate), 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12">
                            {roomType.occupancyRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Current:</span>
                <span className="text-gray-600 ml-2">Active bookings in the period</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Past:</span>
                <span className="text-gray-600 ml-2">Completed bookings</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Projected:</span>
                <span className="text-gray-600 ml-2">Future bookings</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelOccupancyReport;
