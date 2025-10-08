import { useState } from 'react';
import { reportsApi } from '../../services/api';

interface NoShowItem {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  roomType: string;
  roomNumber: string;
  checkInDate: string;
  noShowCharge: number;
  paymentStatus: string;
  paidAmount: number;
}

interface NoShowData {
  date: string;
  totalNoShows: number;
  totalCharges: number;
  totalPaid: number;
  outstanding: number;
  noShows: NoShowItem[];
}

const NoShowReport = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<NoShowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsApi.getNoShow(selectedDate);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">No-Show Report</h2>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total No-Shows</p>
              <p className="text-2xl font-bold text-yellow-700">{reportData.totalNoShows}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Charges</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(reportData.totalCharges)}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(reportData.totalPaid)}</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-orange-700">{formatCurrency(reportData.outstanding)}</p>
            </div>
          </div>

          {reportData.noShows.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">No-Show Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Check-In Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Charge
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.noShows.map((noShow) => (
                      <tr key={noShow.reservationId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{noShow.customerName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{noShow.customerEmail}</p>
                          <p className="text-xs text-gray-500">{noShow.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{noShow.roomNumber}</p>
                          <p className="text-xs text-gray-500">{noShow.roomType}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(noShow.checkInDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(noShow.noShowCharge)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(noShow.paidAmount)}
                        </td>
                        <td className="px-4 py-3">
                          {getPaymentStatusBadge(noShow.paymentStatus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-medium">No no-shows recorded for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoShowReport;
