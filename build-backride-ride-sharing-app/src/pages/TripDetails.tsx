import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Trip, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import { ChevronLeft, MapPin, Calendar, Users, IndianRupee, Package, ArrowRight, Loader2, Info } from 'lucide-react';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  // Parcel Details State
  const [showParcelForm, setShowParcelForm] = useState(false);
  const [parcelDetails, setParcelDetails] = useState({
    weight: '',
    size: '',
    description: ''
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'trips', id));
      if (docSnap.exists()) {
        setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
      }
      setLoading(false);
    };
    fetchTrip();
  }, [id]);

  const handleBooking = async (type: 'ride' | 'parcel') => {
    if (!profile || !trip || !id) return;
    
    if (type === 'parcel' && (!parcelDetails.weight || !parcelDetails.size)) {
      return toast.error('Please fill parcel details');
    }

    try {
      setBookingLoading(true);
      await addDoc(collection(db, 'bookings'), {
        tripId: id,
        passengerId: profile.uid,
        passengerName: profile.name,
        driverId: trip.driverId,
        seats: type === 'ride' ? 1 : 0,
        status: 'pending',
        type,
        parcelDetails: type === 'parcel' ? parcelDetails : null,
        createdAt: serverTimestamp(),
      });
      toast.success('Request sent successfully!');
      navigate('/passenger');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!trip) return <div className="text-center py-20">Trip not found</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Search
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Trip to {trip.destination.address.split(',')[0]}</h1>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Source</p>
                  <p className="text-lg font-bold text-gray-800">{trip.source.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Destination</p>
                  <p className="text-lg font-bold text-gray-800">{trip.destination.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 py-6 border-t border-gray-100">
              <div className="flex flex-col gap-1 text-center">
                <Calendar className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <span className="text-sm text-gray-500 font-medium">Date</span>
                <span className="font-bold text-gray-900">{trip.date}</span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <span className="text-sm text-gray-500 font-medium">Seats Left</span>
                <span className="font-bold text-gray-900">{trip.availableSeats}</span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <IndianRupee className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <span className="text-sm text-gray-500 font-medium">Price</span>
                <span className="font-bold text-gray-900">₹{trip.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Option</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleBooking('ride')}
                disabled={bookingLoading || trip.availableSeats === 0 || profile?.role !== 'passenger'}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-blue-600 text-white rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Book a Seat</h3>
                    <p className="text-sm text-gray-500">Share the ride with {trip.driverName}</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowParcelForm(!showParcelForm)}
                disabled={bookingLoading || profile?.role !== 'passenger'}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${
                  showParcelForm ? 'border-orange-500 bg-orange-50/50' : 'border-orange-100 bg-orange-50/20 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-orange-500 text-white rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Send a Parcel</h3>
                    <p className="text-sm text-gray-500">Fast and secure delivery along route</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 text-orange-500 group-hover:translate-x-1 transition-transform ${showParcelForm ? 'rotate-90' : ''}`} />
              </button>

              {showParcelForm && (
                <div className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 2.5 kg"
                        className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                        value={parcelDetails.weight}
                        onChange={(e) => setParcelDetails({...parcelDetails, weight: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Size</label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                        value={parcelDetails.size}
                        onChange={(e) => setParcelDetails({...parcelDetails, size: e.target.value})}
                      >
                        <option value="">Select Size</option>
                        <option value="Small">Small (Envelope)</option>
                        <option value="Medium">Medium (Box)</option>
                        <option value="Large">Large (Suitcase)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea 
                      rows={2}
                      placeholder="What are you sending?"
                      className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                      value={parcelDetails.description}
                      onChange={(e) => setParcelDetails({...parcelDetails, description: e.target.value})}
                    />
                  </div>
                  <button
                    onClick={() => handleBooking('parcel')}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
                  >
                    Confirm Parcel Request
                  </button>
                </div>
              )}
            </div>

            {profile?.role === 'driver' && (
              <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl text-gray-500">
                <Info className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Drivers cannot book seats or send parcels on their own or other trips.</p>
              </div>
            )}
          </div>
        </div>

        <div className="h-full min-h-[500px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: trip.source.lat, lng: trip.source.lng }}
              zoom={10}
              onLoad={() => {
                const service = new google.maps.DirectionsService();
                service.route(
                  {
                    origin: { lat: trip.source.lat, lng: trip.source.lng },
                    destination: { lat: trip.destination.lat, lng: trip.destination.lng },
                    travelMode: google.maps.TravelMode.DRIVING
                  },
                  (result, status) => {
                    if (status === "OK" && result) setDirections(result);
                  }
                );
              }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Loading Map...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
