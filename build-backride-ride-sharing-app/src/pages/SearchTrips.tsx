import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Trip } from '../types';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, ArrowRight, Filter } from 'lucide-react';

const center = { lat: 20.5937, lng: 78.9629 };

const SearchTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  useEffect(() => {
    const q = query(collection(db, 'trips'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTrips = trips.filter(trip => 
    trip.source.address.toLowerCase().includes(filter.toLowerCase()) ||
    trip.destination.address.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Your Next Ride</h1>
          <div className="relative">
            <Filter className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city or address..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid gap-4">
            {filteredTrips.map(trip => (
              <Link 
                key={trip.id} 
                to={`/trip/${trip.id}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{trip.source.address.split(',')[0]} → {trip.destination.address.split(',')[0]}</h3>
                    <p className="text-sm text-gray-500">Driver: {trip.driverName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-600">₹{trip.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{trip.date} at {trip.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{trip.availableSeats} seats available</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Book Ride / Send Parcel
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900">No rides found</h3>
            <p className="text-gray-500">Try adjusting your search filter</p>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={5}
          >
            {filteredTrips.map(trip => (
              <Marker
                key={trip.id}
                position={{ lat: trip.source.lat, lng: trip.source.lng }}
                title={trip.source.address}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Loading Map...</div>
        )}
      </div>
    </div>
  );
};

export default SearchTrips;
