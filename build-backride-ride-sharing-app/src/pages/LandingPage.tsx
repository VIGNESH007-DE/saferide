import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Package, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/auth';
    if (!profile) return '/role-selection';
    return profile.role === 'driver' ? '/driver' : '/passenger';
  };

  return (
    <div className="flex flex-col gap-16 py-10 overflow-hidden">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            Connect. Ride. <span className="text-blue-600">Save.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg">
            Share your empty return trips with passengers and parcel senders along your route. 
            Reduce costs, help the environment, and earn while you drive.
          </p>
          <div className="flex gap-4">
            <Link
              to={getDashboardLink()}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-lg shadow-blue-200"
            >
              Get Started
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute -z-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl -top-10 -right-10 opacity-50" />
          <div className="absolute -z-10 w-72 h-72 bg-indigo-100 rounded-full blur-3xl -bottom-10 -left-10 opacity-50" />
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
            alt="Driving" 
            className="rounded-3xl shadow-2xl"
          />
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 py-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <Car className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Ride Sharing</h3>
          <p className="text-gray-600">Find drivers traveling your way and share the ride to save money.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <Package className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Parcel Delivery</h3>
          <p className="text-gray-600">Send parcels along active routes for faster and cheaper delivery.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <ShieldCheck className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
          <p className="text-gray-600">Safe and transparent transactions with our platform fee system.</p>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-white">
        <h2 className="text-4xl font-bold text-center mb-16 italic">Simple Steps to Start</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Sign Up', desc: 'Join as a driver or passenger' },
            { step: '02', title: 'Post / Search', desc: 'List your trip or find a ride' },
            { step: '03', title: 'Match', desc: 'Connect with travel partners' },
            { step: '04', title: 'Ride & Pay', desc: 'Complete trip and pay platform fee' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-6xl font-black text-blue-500/20 mb-4">{item.step}</span>
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
