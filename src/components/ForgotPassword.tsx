import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Smartphone } from 'lucide-react';
import { 
  forgotPassword, 
  verifyResetOTP, 
  resetPassword,
  vendorForgotPassword,
  vendorVerifyResetOTP,
  vendorResetPassword
} from '@/service/operations/auth';

interface ForgotPasswordProps {
  userType: 'user' | 'vendor';
  onBack: () => void;
  onSuccess?: () => void;
}

// Phone validation schema
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[1-9]\d{9}$/,
      "Phone number must be 10 digits and not start with 0"
    ),
});

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Password reset schema
const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ userType, onBack, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleRequestOTP = async (data: PhoneFormData) => {
    setLoading(true);
    try {
      if (userType === 'vendor') {
        await vendorForgotPassword(data.phone, otpMethod);
      } else {
        await forgotPassword(data.phone, otpMethod);
      }
      
      setPhone(data.phone);
      setStep('otp');
    } catch (error) {
      console.error('Request OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    setLoading(true);
    try {
      let result;
      if (userType === 'vendor') {
        result = await vendorVerifyResetOTP(phone, data.otp);
      } else {
        result = await verifyResetOTP(phone, data.otp);
      }
      
      if (result?.resetToken) {
        setResetToken(result.resetToken);
        setStep('password');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      if (userType === 'vendor') {
        await vendorResetPassword(resetToken, data.newPassword);
      } else {
        await resetPassword(resetToken, data.newPassword);
      }
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Forgot Password
        </CardTitle>
        <p className="text-gray-600">
          Enter your phone number to receive OTP
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={phoneForm.handleSubmit(handleRequestOTP)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              {...phoneForm.register("phone")}
              className={phoneForm.formState.errors.phone ? "border-destructive" : ""}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Choose OTP Method</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="sms"
                  checked={otpMethod === 'sms'}
                  onChange={(e) => setOtpMethod(e.target.value as 'sms')}
                  className="text-primary"
                />
                <Smartphone className="h-4 w-4" />
                <span>SMS</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="whatsapp"
                  checked={otpMethod === 'whatsapp'}
                  onChange={(e) => setOtpMethod(e.target.value as 'whatsapp')}
                  className="text-primary"
                />
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : `Send OTP via ${otpMethod.toUpperCase()}`}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderOTPStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <p className="text-gray-600">
          Enter the OTP sent to {phone} via {otpMethod.toUpperCase()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              {...otpForm.register("otp")}
              className={`text-center text-lg ${otpForm.formState.errors.otp ? "border-destructive" : ""}`}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-sm text-destructive">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep('phone')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Phone Number
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderPasswordStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <p className="text-gray-600">
          Enter your new password
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              {...passwordForm.register("newPassword")}
              className={passwordForm.formState.errors.newPassword ? "border-destructive" : ""}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              {...passwordForm.register("confirmPassword")}
              className={passwordForm.formState.errors.confirmPassword ? "border-destructive" : ""}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {step === 'phone' && renderPhoneStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'password' && renderPasswordStep()}
    </div>
  );
};

export default ForgotPassword;