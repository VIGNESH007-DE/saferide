import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'react-hot-toast';
import { LogIn, Phone, ShieldCheck, Mail } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully!');
      navigate('/role-selection');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Enter phone number');
    
    try {
      setLoading(true);
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toast.success('OTP sent!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return toast.error('Enter OTP');

    try {
      setLoading(true);
      await confirmationResult.confirm(otp);
      toast.success('Logged in successfully!');
      navigate('/role-selection');
    } catch (error: any) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500">Sign in to access your BackRide account</p>
      </div>

      <div className="space-y-6">
        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all font-medium"
        >
          <Mail className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-sm uppercase"><span className="bg-white px-2 text-gray-400">Or phone OTP</span></div>
        </div>

        {/* Phone Sign In */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone number (+91...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-blue-600 text-sm font-medium hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AuthPage;
