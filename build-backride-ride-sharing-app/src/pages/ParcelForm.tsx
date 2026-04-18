import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trip } from '../types';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';
import { ChevronLeft, Package, Search, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const ParcelForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matchingTrips, setMatchingTrips] = useState<Trip[]>([]);
  const [searched, setSearched] = useState(false);

  const [source, setSource] = useState({ address: '', lat: 0, lng: 0 });
  const [destination, setDestination] = useState({ address: '', lat: 0, lng: 0 });
  const [parcelDetails, setParcelDetails] = useState({
    weight: '',
    size: 'Small',
    description: ''
  });

  const findMatchingTrips = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.address || !destination.address) {
      return toast.error('Please pick source and destination');
    }

    try {
      setLoading(true);
      const q = query(collection(db, 'trips'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const allTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));

      // Simple matching logic: Trips that are roughly in the same cities or nearby
      // In a real app, we'd use distance calculation between lat/lng
      const filtered = allTrips.filter(trip => {
        const sourceMatch = trip.source.address.toLowerCase().includes(source.address.split(',')[0].toLowerCase());
        const destMatch = trip.destination.address.toLowerCase().includes(destination.address.split(',')[0].toLowerCase());
        return sourceMatch || destMatch;
      });

      setMatchingTrips(filtered);
      setSearched(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-500" />
              Send a Parcel
            </h1>
            
            <form onSubmit={findMatchingTrips} className="space-y-6">
              <div className="space-y-4">
                <LocationPicker 
                  label="From" 
                  onSelect={(address, lat, lng) => setSource({ address, lat, lng })}
                />
                <LocationPicker 
                  label="To" 
                  onSelect={(address, lat, lng) => setDestination({ address, lat, lng })}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5kg"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    value={parcelDetails.weight}
                    onChange={(e) => setParcelDetails({...parcelDetails, weight: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    value={parcelDetails.size}
                    onChange={(e) => setParcelDetails({...parcelDetails, size: e.target.value})}
                  >
                    <option value="Small">Small (Envelope)</option>
                    <option value="Medium">Medium (Box)</option>
                    <option value="Large">Large (Suitcase)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    placeholder="What are you sending?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
                    rows={2}
                    value={parcelDetails.description}
                    onChange={(e) => setParcelDetails({...parcelDetails, description: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Drivers
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {searched ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Matching Drivers Along Route</h2>
              {matchingTrips.length > 0 ? (
                <div className="grid gap-4">
                  {matchingTrips.map(trip => (
                    <div 
                      key={trip.id}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {trip.driverName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{trip.driverName}</h3>
                            <p className="text-xs text-gray-400 font-medium uppercase">{trip.date} • {trip.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="line-clamp-1">{trip.source.address.split(',')[0]}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="line-clamp-1">{trip.destination.address.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-medium uppercase">Starts from</p>
                          <p className="text-xl font-black text-blue-600">₹{trip.price}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/trip/${trip.id}`)}
                          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No matching trips yet</h3>
                  <p className="text-gray-500">Try broadening your source/destination cities</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <Calendar className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-lg font-medium">Enter parcel and route details to see matching drivers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParcelForm;
