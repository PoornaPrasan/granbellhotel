import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DailyOccupancyReport from './DailyOccupancyReport';
import NoShowReport from './NoShowReport';
import HotelOccupancyReport from './HotelOccupancyReport';
import FinancialReport from './FinancialReport';

const ReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('daily-occupancy');

  const canViewReport = (reportType: string): boolean => {
    if (!user) return false;

    const permissions: { [key: string]: string[] } = {
      'daily-occupancy': ['admin', 'manager'],
      'no-show': ['admin', 'manager', 'clerk'],
      'hotel-occupancy': ['admin', 'manager', 'clerk', 'travel_company'],
      'financial': ['admin', 'manager', 'clerk'],
    };

    return permissions[reportType]?.includes(user.role) || false;
  };

  const availableTabs = [
    { id: 'daily-occupancy', label: 'Daily Occupancy & Revenue', roles: ['admin', 'manager'] },
    { id: 'no-show', label: 'No-Show Report', roles: ['admin', 'manager', 'clerk'] },
    { id: 'hotel-occupancy', label: 'Hotel Occupancy', roles: ['admin', 'manager', 'clerk', 'travel_company'] },
    { id: 'financial', label: 'Financial Report', roles: ['admin', 'manager', 'clerk'] },
  ].filter(tab => user && tab.roles.includes(user.role));

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view reports.</p>
      </div>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">You do not have permission to view reports.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Generate and view various hotel management reports</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'daily-occupancy' && canViewReport('daily-occupancy') && (
              <DailyOccupancyReport />
            )}

            {activeTab === 'no-show' && canViewReport('no-show') && (
              <NoShowReport />
            )}

            {activeTab === 'hotel-occupancy' && canViewReport('hotel-occupancy') && (
              <HotelOccupancyReport />
            )}

            {activeTab === 'financial' && canViewReport('financial') && (
              <FinancialReport />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
