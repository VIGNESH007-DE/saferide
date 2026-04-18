import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { Search, Package, MapPin, Calendar, Users, ChevronRight, Clock } from 'lucide-react';

const PassengerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'bookings'), where('passengerId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'rejected');

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Journeys</h1>
          <p className="text-gray-600">Track your rides and parcel deliveries</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/passenger/search"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Search className="w-5 h-5" />
            Find Ride
          </Link>
          <Link 
            to="/passenger/parcel"
            className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Package className="w-5 h-5" />
            Send Parcel
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Active Requests</h2>
        {activeBookings.length > 0 ? (
          <div className="grid gap-4">
            {activeBookings.map(booking => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${booking.type === 'parcel' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    {booking.type === 'parcel' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg">Trip to Destination</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        booking.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">With {booking.driverId === profile?.uid ? 'You' : 'Driver'}</p>
                    {booking.parcelDetails && (
                      <p className="text-sm text-gray-600 mt-1">Parcel: {booking.parcelDetails.weight} • {booking.parcelDetails.size}</p>
                    )}
                  </div>
                </div>
                <Link 
                  to={`/trip/${booking.tripId}`}
                  className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                >
                  View Trip & Track
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <MapPin className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No active bookings</h3>
            <p className="text-gray-500 mb-6">Planning a trip? Start by searching for available drivers.</p>
            <Link to="/passenger/search" className="text-blue-600 font-bold hover:underline">Search for rides</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default PassengerDashboard;
