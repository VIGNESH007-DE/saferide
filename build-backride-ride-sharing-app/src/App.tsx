import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import RoleSelection from './pages/RoleSelection';
import DriverDashboard from './pages/DriverDashboard';
import PassengerDashboard from './pages/PassengerDashboard';
import CreateTrip from './pages/CreateTrip';
import SearchTrips from './pages/SearchTrips';
import TripDetails from './pages/TripDetails';
import ParcelForm from './pages/ParcelForm';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'driver' | 'passenger' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!profile) return <Navigate to="/role-selection" />;
  if (role && profile.role !== role) return <Navigate to={profile.role === 'driver' ? '/driver' : '/passenger'} />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              
              {/* Driver Routes */}
              <Route path="/driver" element={
                <ProtectedRoute role="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver/create-trip" element={
                <ProtectedRoute role="driver">
                  <CreateTrip />
                </ProtectedRoute>
              } />

              {/* Passenger Routes */}
              <Route path="/passenger" element={
                <ProtectedRoute role="passenger">
                  <PassengerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/passenger/search" element={
                <ProtectedRoute role="passenger">
                  <SearchTrips />
                </ProtectedRoute>
              } />
              <Route path="/passenger/parcel" element={
                <ProtectedRoute role="passenger">
                  <ParcelForm />
                </ProtectedRoute>
              } />

              {/* Shared Routes */}
              <Route path="/trip/:id" element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
