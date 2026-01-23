import React from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, Plus, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '@/services/mockDatabase';

const OrganizerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const tournaments = mockDB.getTournaments();
    const activeTournaments = tournaments.filter(t => t.status === 'active').length;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Organizer Dashboard" />

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-8 h-8 text-primary mb-2" />
                            <p className="text-2xl font-bold">{tournaments.length}</p>
                            <p className="text-xs text-muted-foreground">Total Tournaments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Calendar className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-2xl font-bold">{activeTournaments}</p>
                            <p className="text-xs text-muted-foreground">Active Now</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        className="h-auto py-4 flex flex-col gap-2"
                        onClick={() => navigate('/organizer/create-tournament')}
                    >
                        <Plus className="w-6 h-6" />
                        <span>Create Tournament</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-auto py-4 flex flex-col gap-2"
                        onClick={() => navigate('/organizer/grounds')}
                    >
                        <MapPin className="w-6 h-6" />
                        <span>Manage Grounds</span>
                    </Button>
                </div>

                {/* Recent Tournaments List */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">My Tournaments</h2>
                    {tournaments.length === 0 ? (
                        <div className="text-center py-8 bg-card rounded-xl border border-dashed">
                            <p className="text-muted-foreground mb-2">No tournaments yet</p>
                            <Button size="sm" onClick={() => navigate('/organizer/create-tournament')}>
                                Create your first one
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tournaments.map(t => (
                                <div key={t.id} className="bg-card p-4 rounded-xl shadow-sm border border-border flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{t.name}</h3>
                                        <p className="text-xs text-muted-foreground">{t.city} • {t.matchFormat} Overs</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/organizer/tournament/${t.id}`)}>
                                        Manage
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrganizerDashboard;
