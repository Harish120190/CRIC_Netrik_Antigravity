import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '@/components/teams/QRScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, Keyboard, Loader2 } from 'lucide-react';

export default function JoinTeamPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { joinTeamByCode } = useTeamManagement();
  const [teamCode, setTeamCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const parseQRData = (data: string): string | null => {
    try {
      // Try to parse as JSON (our QR format includes teamCode)
      const parsed = JSON.parse(data);
      if (parsed.teamCode) {
        return parsed.teamCode;
      }
    } catch {
      // If not JSON, check if it's a plain team code (6 alphanumeric chars)
      const cleanCode = data.trim().toUpperCase();
      if (/^[A-Z0-9]{6}$/.test(cleanCode)) {
        return cleanCode;
      }
      
      // Check if it's a URL with team code
      const urlMatch = data.match(/[?&]code=([A-Z0-9]{6})/i);
      if (urlMatch) {
        return urlMatch[1].toUpperCase();
      }
    }
    return null;
  };

  const handleJoinTeam = async (code: string) => {
    if (!user || !profile) {
      toast.error('Please sign in to join a team');
      navigate('/auth/signin');
      return;
    }

    if (!profile.mobile_number) {
      toast.error('Please add a mobile number to your profile first');
      navigate('/profile');
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinTeamByCode(
        code,
        user.id,
        profile.mobile_number,
        profile.full_name
      );

      if (result.success) {
        toast.success(result.message || 'Successfully joined team!');
        navigate('/teams');
      } else {
        toast.error(result.message || 'Failed to join team');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('An error occurred while joining the team');
    } finally {
      setIsJoining(false);
    }
  };

  const handleQRScan = (result: string) => {
    const code = parseQRData(result);
    if (code) {
      handleJoinTeam(code);
    } else {
      toast.error('Invalid QR code. Please scan a valid team QR code.');
    }
  };

  const handleManualJoin = () => {
    const cleanCode = teamCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(cleanCode)) {
      toast.error('Team code must be 6 alphanumeric characters');
      return;
    }
    handleJoinTeam(cleanCode);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Please sign in to join a team</p>
            <Button onClick={() => navigate('/auth/signin')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Join Team</h1>
        </div>
      </header>

      <main className="container max-w-md mx-auto p-4">
        {isJoining ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Joining team...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Enter Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-4">
              <QRScanner onScan={handleQRScan} />
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enter Team Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter 6-character code"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest uppercase"
                  />
                  <Button
                    onClick={handleManualJoin}
                    className="w-full"
                    disabled={teamCode.length !== 6}
                  >
                    Join Team
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Ask your team captain for the 6-character team code
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
