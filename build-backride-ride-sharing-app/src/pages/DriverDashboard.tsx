import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Trip, Booking } from '../types';
import { toast } from 'react-hot-toast';
import { Plus, MapPin, Calendar, Users, CreditCard, ChevronRight, CheckCircle2, Package, Car } from 'lucide-react';

const DriverDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const tripsQuery = query(collection(db, 'trips'), where('driverId', '==', profile.uid));
    const bookingsQuery = query(collection(db, 'bookings'), where('driverId', '==', profile.uid));

    const unsubTrips = onSnapshot(tripsQuery, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
    });

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    });

    return () => {
      unsubTrips();
      unsubBookings();
    };
  }, [profile]);

  const handleTripAction = async (tripId: string, action: 'complete' | 'cancel') => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status: action === 'complete' ? 'completed' : 'cancelled'
      });
      toast.success(`Trip ${action}ed!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { status });
      
      if (status === 'accepted' && booking.type === 'ride') {
        const tripRef = doc(db, 'trips', booking.tripId);
        const tripSnap = await getDoc(tripRef);
        if (tripSnap.exists()) {
          const tripData = tripSnap.data() as Trip;
          await updateDoc(tripRef, {
            availableSeats: tripData.availableSeats - booking.seats
          });
        }
      }
      
      toast.success(`Booking ${status}!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePayment = async (tripId: string) => {
    // Razorpay Integration Placeholder
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: 1000, // INR 10.00
      currency: "INR",
      name: "BackRide Platform Fee",
      description: "Platform fee for trip completion",
      handler: async (response: any) => {
        try {
          await addDoc(collection(db, 'payments'), {
            driverId: profile?.uid,
            tripId,
            amount: 10,
            status: 'paid',
            razorpayPaymentId: response.razorpay_payment_id,
            timestamp: new Date()
          });
          await updateDoc(doc(db, 'trips', tripId), { paymentStatus: 'paid' });
          toast.success('Platform fee paid successfully!');
        } catch (error: any) {
          toast.error('Payment recorded failed in DB');
        }
      },
      prefill: {
        name: profile?.name,
        contact: profile?.phoneNumber
      },
      theme: { color: "#2563eb" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const activeTrips = trips.filter(t => t.status === 'active');
  const completedTrips = trips.filter(t => t.status === 'completed');
  const pendingRequests = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Manage your trips and earn from return journeys</p>
        </div>
        <Link 
          to="/driver/create-trip"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Post New Trip
        </Link>
      </header>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            New Requests ({pendingRequests.length})
          </h2>
          <div className="grid gap-4">
            {pendingRequests.map(booking => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${booking.type === 'parcel' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    {booking.type === 'parcel' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{booking.passengerName}</h4>
                    <p className="text-gray-500 text-sm">{booking.type === 'ride' ? `Requested ${booking.seats} seats` : 'Wants to send a parcel'}</p>
                    {booking.parcelDetails && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{booking.parcelDetails.description}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBookingAction(booking, 'rejected')}
                    className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleBookingAction(booking, 'accepted')}
                    className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Trips */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Active Trips</h2>
        {activeTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {activeTrips.map(trip => (
              <div key={trip.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-medium line-clamp-1">{trip.source.address}</span>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-200 ml-2"></div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm font-medium line-clamp-1">{trip.destination.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">₹{trip.price}</span>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">per seat</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{trip.date} at {trip.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{trip.availableSeats}/{trip.seats} seats left</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleTripAction(trip.id, 'complete')}
                    className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <Car className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No active trips</h3>
            <p className="text-gray-500 mb-6">Start earning by listing your next return journey</p>
            <Link to="/driver/create-trip" className="text-blue-600 font-bold hover:underline">Create a trip now</Link>
          </div>
        )}
      </section>

      {/* Completed & Payments */}
      {completedTrips.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {completedTrips.map((trip, i) => (
              <div key={trip.id} className={`p-6 flex items-center justify-between ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{trip.source.address.split(',')[0]} to {trip.destination.address.split(',')[0]}</h4>
                    <p className="text-sm text-gray-500">{trip.date}</p>
                  </div>
                </div>
                <div>
                  {(trip as any).paymentStatus === 'paid' ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Fee Paid</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handlePayment(trip.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay ₹10 Fee
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DriverDashboard;
