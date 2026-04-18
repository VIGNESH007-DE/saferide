import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';
import { ChevronLeft, Loader2, IndianRupee, Users, Calendar, Clock } from 'lucide-react';

const CreateTrip: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [source, setSource] = useState({ address: '', lat: 0, lng: 0 });
  const [destination, setDestination] = useState({ address: '', lat: 0, lng: 0 });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!source.address || !destination.address) {
      return toast.error('Please pick source and destination on map');
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'trips'), {
        driverId: profile.uid,
        driverName: profile.name,
        source,
        destination,
        date,
        time,
        seats,
        availableSeats: seats,
        price,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      toast.success('Trip posted successfully!');
      navigate('/driver');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post Return Trip</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <LocationPicker 
              label="Source (Where are you starting?)" 
              onSelect={(address, lat, lng) => setSource({ address, lat, lng })}
            />
            <LocationPicker 
              label="Destination (Where are you going?)" 
              onSelect={(address, lat, lng) => setDestination({ address, lat, lng })}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="time" 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Available Seats</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="number" 
                  min="1"
                  max="7"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price per Seat (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'List Your Trip'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
