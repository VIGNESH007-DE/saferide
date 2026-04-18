import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Car, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

const RoleSelection: React.FC = () => {
  const { user, setProfile } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState(user?.displayName || '');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role || !name) return;
    if (role === 'driver' && (!vehicleNumber || !licenseFile)) {
      return toast.error('Please provide vehicle number and license');
    }

    try {
      setLoading(true);
      let licenseUrl = '';

      if (role === 'driver' && licenseFile) {
        const storageRef = ref(storage, `users/${user.uid}/license-${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, licenseFile);
        licenseUrl = await getDownloadURL(snapshot.ref);
      }

      const userData = {
        uid: user.uid,
        name,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role,
        vehicleNumber: role === 'driver' ? vehicleNumber : '',
        licenseUrl,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setProfile(userData as any);
      toast.success('Profile created successfully!');
      navigate(role === 'driver' ? '/driver' : '/passenger');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h1>
        <p className="text-lg text-gray-600">Join BackRide as a driver or a passenger</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <button
          onClick={() => setRole('passenger')}
          className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
            role === 'passenger' 
              ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100' 
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className={`p-4 rounded-2xl ${role === 'passenger' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Passenger</h3>
            <p className="text-sm text-gray-500">I want to find rides and send parcels</p>
          </div>
        </button>

        <button
          onClick={() => setRole('driver')}
          className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
            role === 'driver' 
              ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100' 
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className={`p-4 rounded-2xl ${role === 'driver' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Driver</h3>
            <p className="text-sm text-gray-500">I have a vehicle and want to share my trips</p>
          </div>
        </button>
      </div>

      {role && (
        <form onSubmit={handleCompleteSignup} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {role === 'driver' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MH12AB1234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driving License</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      className="hidden"
                      id="license-upload"
                      onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="license-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{licenseFile ? licenseFile.name : 'Upload license image'}</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Complete Signup</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default RoleSelection;
