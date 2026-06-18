import React, { useState } from 'react';

interface ForgotPasswordProps {
  userType: 'user' | 'vendor';
  onSuccess?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ userType, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE = '/api';

  const handleRequestOTP = async () => {
    if (!phone) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = userType === 'vendor' 
        ? `${API_BASE}/vendor/forgot-password` 
        : `${API_BASE}/auth/forgot-password`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otpMethod })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setStep('otp');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = userType === 'vendor' 
        ? `${API_BASE}/vendor/verify-reset-otp` 
        : `${API_BASE}/auth/verify-reset-otp`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (data.success) {
        setResetToken(data.resetToken);
        setMessage(data.message);
        setStep('password');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = userType === 'vendor' 
        ? `${API_BASE}/vendor/reset-password` 
        : `${API_BASE}/auth/reset-password`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password reset successfully! You can now login with your new password.');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Forgot Password - {userType === 'vendor' ? 'Vendor' : 'User'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          OTP Method
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="sms"
              checked={otpMethod === 'sms'}
              onChange={(e) => setOtpMethod(e.target.value as 'sms')}
              className="mr-2"
            />
            SMS
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="whatsapp"
              checked={otpMethod === 'whatsapp'}
              onChange={(e) => setOtpMethod(e.target.value as 'whatsapp')}
              className="mr-2"
            />
            WhatsApp
          </label>
        </div>
      </div>

      <button
        onClick={handleRequestOTP}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending OTP...' : `Send OTP via ${otpMethod.toUpperCase()}`}
      </button>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
      
      <p className="text-center text-gray-600">
        Enter the OTP sent to {phone} via {otpMethod.toUpperCase()}
      </p>

      <div>
        <label className="block text-sm font-medium mb-2">
          OTP Code
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
        />
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <button
        onClick={() => setStep('phone')}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
      >
        Back to Phone Number
      </button>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleResetPassword}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {step === 'phone' && renderPhoneStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'password' && renderPasswordStep()}
    </div>
  );
};

export default ForgotPassword;

// Usage Example:
// <ForgotPassword 
//   userType="user" 
//   onSuccess={() => navigate('/login')} 
// />
// 
// <ForgotPassword 
//   userType="vendor" 
//   onSuccess={() => navigate('/vendor/login')} 
// />