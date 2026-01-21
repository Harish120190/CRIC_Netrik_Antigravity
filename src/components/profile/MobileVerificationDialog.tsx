import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MobileVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onVerified: () => void;
}

const MobileVerificationDialog: React.FC<MobileVerificationDialogProps> = ({
  open,
  onOpenChange,
  phoneNumber,
  onVerified
}) => {
  const [step, setStep] = useState<'sending' | 'verify'>('sending');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (open && phoneNumber) {
      sendOtp();
    }
    return () => {
      setOtp('');
      setStep('sending');
      setResendTimer(0);
    };
  }, [open, phoneNumber]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOtp = async () => {
    setStep('sending');
    setLoading(true);
    
    try {
      // Use Supabase phone OTP for verification
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code",
          variant: "destructive"
        });
        onOpenChange(false);
        return;
      }

      setStep('verify');
      setResendTimer(60);
      toast({
        title: "Code Sent",
        description: `Verification code sent to ${phoneNumber}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive"
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
        setOtp('');
        return;
      }

      toast({
        title: "Verified",
        description: "Mobile number verified successfully!"
      });
      onVerified();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp('');
    sendOtp();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Verify Mobile Number
          </DialogTitle>
          <DialogDescription>
            {step === 'sending' 
              ? 'Sending verification code...'
              : `Enter the 6-digit code sent to ${phoneNumber}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'sending' ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
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
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-primary hover:underline font-medium"
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileVerificationDialog;
