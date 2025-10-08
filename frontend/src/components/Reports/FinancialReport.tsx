import { useState } from 'react';
import { reportsApi } from '../../services/api';

interface RevenueItem {
  type?: string;
  category?: string;
  method?: string;
  amount: number;
}

interface FinancialData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalRevenue: number;
  roomRevenue: {
    total: number;
    byRoomType: RevenueItem[];
  };
  additionalRevenue: {
    total: number;
    byCategory: RevenueItem[];
  };
  revenueByPaymentMethod: RevenueItem[];
  outstandingBalances: number;
}

const FinancialReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(lastMonth);
  const [endDate, setEndDate] = useState<string>(today);
  const [reportData, setReportData] = useState<FinancialData | null>(null);
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
      const response = await reportsApi.getFinancial(startDate, endDate);
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

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Financial Report</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={today}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={today}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(reportData.totalRevenue)}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Room Revenue</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(reportData.roomRevenue.total)}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Additional Revenue</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(reportData.additionalRevenue.total)}</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-orange-700">{formatCurrency(reportData.outstandingBalances)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Room Type</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Room Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.roomRevenue.byRoomType.map((item) => (
                      <tr key={item.type} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                          {item.type}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Service Category</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.additionalRevenue.byCategory.map((item) => (
                      <tr key={item.category} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                          {item.category?.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.revenueByPaymentMethod.map((item) => (
                <div key={item.method} className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1 capitalize">
                    {item.method?.replace('_', ' ')}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
