import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { toast } from 'sonner';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name too long'),
});

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTeam, loading } = useTeamManagement();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to create a team');
      navigate('/auth/signin');
      return;
    }

    const validation = teamSchema.safeParse({ name });
    if (!validation.success) {
      const fieldErrors: { name?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const team = await createTeam({ name }, user.id);

    if (team) {
      toast.success('Team created successfully!');
      navigate(`/teams/${team.id}`);
    } else {
      toast.error('Failed to create team');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Please sign in to create a team</p>
          <Button onClick={() => navigate('/auth/signin')}>Sign In</Button>
        </div>
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
          <h1 className="font-semibold">Create Team</h1>
        </div>
      </header>

      <main className="container max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>New Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  placeholder="Enter team name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
              A unique team code and QR code will be generated automatically
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateTeamPage;
