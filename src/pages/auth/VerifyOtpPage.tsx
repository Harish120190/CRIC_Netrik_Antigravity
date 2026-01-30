import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSlot,
// } from "@/components/ui/input-otp";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  const mobile = location.state?.mobile;

  useEffect(() => {
    if (!mobile) {
      navigate('/auth/signin');
    }
  }, [mobile, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    setIsSubmitting(true);
    try {
      const success = await verifyOtp(mobile, otp);
      if (success) {
        toast.success("Mobile number verified successfully!");
        navigate('/'); // Go to dashboard
      } else {
        toast.error("Invalid OTP. Try '1234'");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Verify Mobile</CardTitle>
          </div>
          <CardDescription>
            Enter the 4-digit code sent to <span className="font-semibold">{mobile}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center py-4">
              <Input
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-2xl tracking-[1em] h-14"
                placeholder="0000"
              />
              {/* <InputOTP maxLength={4} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP> */}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Did not receive the code?</p>
              <Button variant="link" className="p-0 h-auto font-semibold text-primary" type="button" onClick={() => toast.info("Resending OTP...")}>
                Resend Code
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={otp.length !== 4 || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Verify & Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 mt-2 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-muted-foreground">Demo OTP: 1234</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;