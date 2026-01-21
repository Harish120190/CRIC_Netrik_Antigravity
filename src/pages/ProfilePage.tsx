import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import MobileVerificationDialog from '@/components/profile/MobileVerificationDialog';
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  LogOut,
  Edit2,
  Check,
  X,
  Loader2,
  Users,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editMobile, setEditMobile] = useState(profile?.mobile_number || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pendingMobileNumber, setPendingMobileNumber] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/signin');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({ full_name: editName.trim() });
      setIsEditingName(false);
      toast({
        title: "Success",
        description: "Name updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMobile = async () => {
    const cleanedMobile = editMobile.replace(/\s/g, '');
    
    // Validate phone format
    if (!cleanedMobile) {
      // Allow clearing the mobile number without verification
      setIsSaving(true);
      try {
        await updateProfile({ mobile_number: null, mobile_verified: false });
        setIsEditingMobile(false);
        toast({
          title: "Success",
          description: "Mobile number removed"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove mobile number",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Ensure phone starts with + for international format
    const formattedMobile = cleanedMobile.startsWith('+') ? cleanedMobile : `+${cleanedMobile}`;
    
    if (!/^\+[0-9]{10,15}$/.test(formattedMobile)) {
      toast({
        title: "Error",
        description: "Please enter a valid mobile number with country code (e.g., +919876543210)",
        variant: "destructive"
      });
      return;
    }
    
    // If the number hasn't changed, no need to verify
    if (formattedMobile === profile?.mobile_number && profile?.mobile_verified) {
      setIsEditingMobile(false);
      return;
    }

    // Trigger OTP verification
    setPendingMobileNumber(formattedMobile);
    setShowVerificationDialog(true);
  };

  const handleMobileVerified = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ 
        mobile_number: pendingMobileNumber, 
        mobile_verified: true 
      });
      setIsEditingMobile(false);
      setEditMobile(pendingMobileNumber);
      toast({
        title: "Success",
        description: "Mobile number verified and updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mobile number",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setPendingMobileNumber('');
    }
  };

  const cancelEditName = () => {
    setEditName(profile?.full_name || '');
    setIsEditingName(false);
  };

  const cancelEditMobile = () => {
    setEditMobile(profile?.mobile_number || '');
    setIsEditingMobile(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Profile" showSearch={false} />
        <div className="flex flex-col items-center justify-center p-6 mt-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Not Signed In</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">Please sign in to view your profile</p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth/signin')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Profile" showSearch={false} />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="gradient-pitch h-20" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col items-center -mt-10">
              <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getInitials(profile?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-3 text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.full_name || 'User'}
                </h2>
                {profile?.mobile_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={cancelEditName}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    {profile?.full_name || 'Not set'}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => {
                      setEditName(profile?.full_name || '');
                      setIsEditingName(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number
                {profile?.mobile_verified && (
                  <Badge variant="secondary" className="gap-1 ml-2">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </Label>
              {isEditingMobile ? (
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    placeholder="+919876543210"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleSaveMobile}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={cancelEditMobile}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      {profile?.mobile_number || 'Not set'}
                    </span>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => {
                      setEditMobile(profile?.mobile_number || '');
                      setIsEditingMobile(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">
                  {user.email || 'Not set'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/teams')}
            >
              <Users className="h-4 w-4" />
              My Teams
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/join-team')}
            >
              <UserPlus className="h-4 w-4" />
              Join a Team
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Verification Dialog */}
        <MobileVerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          phoneNumber={pendingMobileNumber}
          onVerified={handleMobileVerified}
        />
      </main>
    </div>
  );
};

export default ProfilePage;
