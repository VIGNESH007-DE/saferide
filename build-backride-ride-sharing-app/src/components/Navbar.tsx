import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <Car className="w-8 h-8" />
          <span>BackRide</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {profile && (
                <Link 
                  to={profile.role === 'driver' ? '/driver' : '/passenger'}
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{user.displayName || user.phoneNumber || 'User'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
