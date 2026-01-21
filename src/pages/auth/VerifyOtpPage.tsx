import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const phone = location.state?.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/auth/signin');
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOtp(phone, otp);

      if (error) {
        toast.error('Invalid OTP. Please try again.');
        return;
      }

      toast.success('Phone verified successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Would trigger resend OTP
    toast.info('OTP resent to your phone');
    setResendTimer(60);
  };

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-pitch flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">OTP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verify Phone</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to {phone}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          variant="pitch"
          size="lg"
          className="w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in {resendTimer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:underline font-medium"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;