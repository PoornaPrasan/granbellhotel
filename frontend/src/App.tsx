import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HotelProvider } from './contexts/HotelContext';
import LandingPage from './components/Landing/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import ReservationList from './components/Reservations/ReservationList';
import MyInvoices from './components/Invoices/MyInvoices';
import UserManagement from './components/Admin/UserManagement';
import RoomManagement from './components/Admin/RoomManagement';
import CheckInOut from './components/Admin/CheckInOut';
import GuestsManagement from './components/Admin/GuestsManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup'>('landing');

  // Show different views for non-authenticated users
  if (!isAuthenticated) {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onBack={() => setCurrentView('landing')}
            onSwitchToSignUp={() => setCurrentView('signup')}
          />
        );
      case 'signup':
        return (
          <SignUpForm 
            onBack={() => setCurrentView('landing')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <LandingPage 
            onLogin={() => setCurrentView('login')}
            onSignUp={() => setCurrentView('signup')}
          />
        );
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservations':
        return <ReservationList />;
      case 'users':
        return <UserManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'checkin':
        return <CheckInOut />;
      case 'rooms':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Management</h2>
            <p className="text-gray-600">Room management functionality coming soon...</p>
          </div>
        );
      case 'guests':
        return <GuestsManagement />;
      case 'billing':
        return <MyInvoices />;
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reporting functionality coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Settings</h2>
            <p className="text-gray-600">Settings functionality coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <AppContent />
      </HotelProvider>
    </AuthProvider>
  );
}

export default App;