import React, { useState } from "react";
import { X, Phone, MessageSquare, Loader2 } from "lucide-react";
import { sendPhoneVerificationOTP, verifyPhoneOTP } from "@/service/operations/auth";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  userId,
  phoneNumber,
  onVerificationSuccess,
}) => {
  const [step, setStep] = useState<"method" | "otp">("method");
  const [otpMethod, setOtpMethod] = useState<"whatsapp" | "sms">("whatsapp");
  const [otp, setOtp] = useState("");
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [loadingSMS, setLoadingSMS] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  if (!isOpen) return null;

  const handleSendOTP = async (method: "whatsapp" | "sms") => {
    if (method === "whatsapp") {
      setLoadingWhatsApp(true);
    } else {
      setLoadingSMS(true);
    }
    
    try {
      await sendPhoneVerificationOTP(userId, method);
      setOtpMethod(method);
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setLoadingWhatsApp(false);
      setLoadingSMS(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      return;
    }

    setLoadingVerify(true);
    try {
      await verifyPhoneOTP(userId, otp);
      onVerificationSuccess();
      onClose();
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {step === "method" ? (
          <>
            {/* Method Selection */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verify Your Phone Number
              </h2>
              <p className="text-gray-600">
                Phone: <span className="font-semibold">{phoneNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Choose how you'd like to receive your verification code
              </p>
            </div>

            {/* Method Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSendOTP("whatsapp")}
                disabled={loadingWhatsApp || loadingSMS}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingWhatsApp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MessageSquare className="w-5 h-5" />
                )}
                <span>Send OTP via WhatsApp</span>
              </button>

              <button
                onClick={() => handleSendOTP("sms")}
                disabled={loadingWhatsApp || loadingSMS}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSMS ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
                <span>Send OTP via SMS</span>
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can verify your phone number later from your profile
            </p>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {otpMethod === "whatsapp" ? (
                  <MessageSquare className="w-8 h-8 text-green-600" />
                ) : (
                  <Phone className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Enter Verification Code
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit code to your phone via{" "}
                <span className="font-semibold">
                  {otpMethod === "whatsapp" ? "WhatsApp" : "SMS"}
                </span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 tracking-widest"
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={loadingVerify || otp.length !== 6}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingVerify ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Phone Number</span>
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center mt-4">
              <button
                onClick={() => handleSendOTP(otpMethod)}
                disabled={loadingVerify}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setStep("method")}
              className="w-full mt-3 px-6 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              ← Change Method
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneVerificationModal;
