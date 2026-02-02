import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockDB, Tournament, TournamentTeam, Match } from '@/services/mockDatabase';
import { Users, Calendar, Trophy, Settings, CheckCircle, XCircle, Play, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StaffAssignmentDialog } from '@/components/organizer/StaffAssignmentDialog';
import { User, PointAdjustment } from '@/services/mockDatabase';
import FixtureEditor from '@/components/tournament/FixtureEditor';
import PointsOverrideDialog from '@/components/tournament/PointsOverrideDialog';
import AdjustmentAuditTrail from '@/components/tournament/AdjustmentAuditTrail';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const TournamentManagePage: React.FC = () => {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | undefined>();
    const [teams, setTeams] = useState<TournamentTeam[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
    const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
    const [selectedTeamToAdd, setSelectedTeamToAdd] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
    const [selectedTeamForAdjustment, setSelectedTeamForAdjustment] = useState<{ id: string; name: string } | null>(null);
    const [auditDialogOpen, setAuditDialogOpen] = useState(false);
    const [selectedTeamAdjustments, setSelectedTeamAdjustments] = useState<PointAdjustment[]>([]);
    const { user } = useAuth();

    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [teamToReject, setTeamToReject] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (tournamentId) {
            const t = mockDB.getTournament(tournamentId);
            if (t) {
                setTournament(t);
                setTeams(mockDB.getTournamentTeams(tournamentId));
                setMatches(mockDB.getTournamentMatches(tournamentId));
                setAllUsers(mockDB.getUsers());
            }
            setLoading(false);
        }
    }, [tournamentId]);

    const handleApproveTeam = (id: string) => {
        mockDB.updateTournamentTeam(id, { status: 'approved' });
        setTeams(mockDB.getTournamentTeams(tournamentId!));
        toast.success("Team approved");
    };

    const confirmRejectTeam = (id: string) => {
        setTeamToReject(id);
        setRejectionReason('');
        setRejectionDialogOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!teamToReject) return;

        mockDB.updateTournamentTeam(teamToReject, {
            status: 'rejected',
            rejection_reason: rejectionReason
        });

        setTeams(mockDB.getTournamentTeams(tournamentId!));
        setRejectionDialogOpen(false);
        setTeamToReject(null);
        toast.error("Team rejected");
    };

    const generateFixtures = () => {
        const approvedTeams = teams.filter(t => t.status === 'approved');
        if (approvedTeams.length < 2) {
            toast.error("Need at least 2 approved teams to generate fixtures");
            return;
        }
        mockDB.generateFixtures(tournamentId!);
        setMatches(mockDB.getTournamentMatches(tournamentId!));
        toast.success("Fixtures generated successfully!");
    };

    const handleAddTeam = () => {
        if (!selectedTeamToAdd) return;

        // Check if already registered
        if (teams.find(t => t.teamId === selectedTeamToAdd)) {
            toast.error("Team already registered");
            return;
        }

        mockDB.registerTeamForTournament(selectedTeamToAdd, tournamentId!);
        // Auto approve if added by organizer
        const newTeams = mockDB.getTournamentTeams(tournamentId!);
        const newEntry = newTeams.find(t => t.teamId === selectedTeamToAdd);
        if (newEntry) {
            mockDB.updateTournamentTeam(newEntry.id, { status: 'approved' });
        }

        setTeams(mockDB.getTournamentTeams(tournamentId!));
        setIsAddTeamDialogOpen(false);
        setSelectedTeamToAdd('');
        toast.success("Team added and approved");
    };

    const handleCreateTeam = () => {
        if (!newTeamName) return;

        const newTeam = mockDB.createTeam(newTeamName, user?.id);
        mockDB.registerTeamForTournament(newTeam.id, tournamentId!);

        // Auto approve
        const newTeams = mockDB.getTournamentTeams(tournamentId!);
        const newEntry = newTeams.find(t => t.teamId === newTeam.id);
        if (newEntry) {
            mockDB.updateTournamentTeam(newEntry.id, { status: 'approved' });
        }

        setTeams(mockDB.getTournamentTeams(tournamentId!));
        setIsCreateTeamDialogOpen(false);
        setNewTeamName('');
        toast.success(`Team "${newTeamName}" created and added`);
    };

    const handleOpenAdjustmentDialog = (teamId: string, teamName: string) => {
        setSelectedTeamForAdjustment({ id: teamId, name: teamName });
        setAdjustmentDialogOpen(true);
    };

    const handleOpenAuditDialog = (teamId: string) => {
        const adjustments = mockDB.getTeamAdjustments(teamId);
        setSelectedTeamAdjustments(adjustments);
        setAuditDialogOpen(true);
    };

    const refreshData = () => {
        if (tournamentId) {
            setTeams(mockDB.getTournamentTeams(tournamentId));
            setMatches(mockDB.getTournamentMatches(tournamentId));
        }
    };

    const calculateTeamPoints = (teamId: string) => {
        // Calculate match points (2 for win, 1 for tie/draw)
        const teamMatches = matches.filter(m =>
            (m.team1_id === teamId || m.team2_id === teamId) && m.status === 'completed'
        );
        let matchPoints = 0;
        const team = registeredTeams.find(t => t.id === teamId);
        teamMatches.forEach(m => {
            if (m.winner_name === team?.name) matchPoints += 2;
            else if (m.winner_name === 'Draw' || m.winner_name === 'Tie') matchPoints += 1;
        });

        // Add adjustment points
        const adjustments = mockDB.getTeamAdjustments(teamId);
        const adjustmentPoints = adjustments.reduce((sum, adj) => sum + adj.points_change, 0);

        return { matchPoints, adjustmentPoints, total: matchPoints + adjustmentPoints };
    };

    const canAdjustPoints = user?.role === 'organizer' || user?.role === 'admin';

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!tournament) return <div className="p-8 text-center">Tournament not found</div>;

    const registeredTeams = mockDB.getTeams();

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title={`Manage: ${tournament.name}`} />

            <main className="px-4 py-6 max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-6 items-center justify-between w-full">
                    <div className="flex gap-2">
                        <Badge variant={tournament.status === 'open_for_registration' || tournament.status === 'ongoing' ? 'default' : 'secondary'}>
                            {tournament.status?.replace(/_/g, ' ').toUpperCase() || 'DRAFT'}
                        </Badge>
                        <Badge variant="outline">{tournament.matchType?.toUpperCase() || 'N/A'}</Badge>
                        <Badge variant="outline">{tournament.matchFormat || 0} Overs</Badge>
                    </div>
                    {tournament.status === 'draft' && (
                        <Button
                            onClick={() => {
                                mockDB.updateTournament(tournament.id, { status: 'open_for_registration' });
                                setTournament({ ...tournament, status: 'open_for_registration' });
                                toast.success("Tournament Published! Teams can now register.");
                            }}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Publish Tournament
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
                        <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
                        <TabsTrigger value="standings">Standings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Registered Teams
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{teams.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {teams.filter(t => t.status === 'approved').length} Approved
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Total Matches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{matches.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {matches.filter(m => m.status === 'completed').length} Completed
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Trophy className="w-4 h-4" /> Prize Pool
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹ --</div>
                                    <p className="text-xs text-muted-foreground">Winners take all</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => navigate(`/schedule-match`)}>
                                <Calendar className="w-4 h-4 mr-2" /> Add Match
                            </Button>
                            <Button onClick={generateFixtures}>
                                <Settings className="w-4 h-4 mr-2" /> Generate Fixtures
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="teams">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Team Registrations</CardTitle>
                                <div className="flex gap-2">
                                    <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                <Plus className="w-4 h-4 mr-2" /> Create Team
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Team</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Team Name</label>
                                                    <input
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="Enter team name"
                                                        value={newTeamName}
                                                        onChange={(e) => setNewTeamName(e.target.value)}
                                                    />
                                                </div>
                                                <Button className="w-full" onClick={handleCreateTeam} disabled={!newTeamName}>
                                                    Create & Add
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <Plus className="w-4 h-4 mr-2" /> Add Team
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Existing Team</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Select Team</label>
                                                    <Select value={selectedTeamToAdd} onValueChange={setSelectedTeamToAdd}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose a team" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {registeredTeams
                                                                .filter(t => !teams.find(tt => tt.teamId === t.id))
                                                                .map(team => (
                                                                    <SelectItem key={team.id} value={team.id}>
                                                                        {team.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button className="w-full" onClick={handleAddTeam} disabled={!selectedTeamToAdd}>
                                                    Add Team
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teams.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No teams registered yet.</p>
                                    ) : (
                                        teams.map(tt => {
                                            const team = registeredTeams.find(t => t.id === tt.teamId);
                                            return (
                                                <div key={tt.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold">{team?.name || 'Unknown Team'}</h4>
                                                        <p className="text-xs text-muted-foreground">Joined {new Date(tt.joinedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {tt.status === 'pending' ? (
                                                            <>
                                                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApproveTeam(tt.id)}>
                                                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => confirmRejectTeam(tt.id)}>
                                                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-end">
                                                                <Badge variant={tt.status === 'approved' ? 'default' : 'destructive'}>
                                                                    {tt.status.toUpperCase()}
                                                                </Badge>
                                                                {tt.status === 'rejected' && tt.rejection_reason && (
                                                                    <span className="text-[10px] text-red-500 max-w-[150px] truncate" title={tt.rejection_reason}>
                                                                        {tt.rejection_reason}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="fixtures" className="space-y-4">
                        <FixtureEditor tournamentId={tournamentId!} />
                    </TabsContent>

                    <TabsContent value="standings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Points Table</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left p-2">Team</th>
                                                <th className="text-center p-2">P</th>
                                                <th className="text-center p-2">W</th>
                                                <th className="text-center p-2">L</th>
                                                <th className="text-center p-2">NRR</th>
                                                <th className="text-center p-2">Pts</th>
                                                <th className="text-center p-2">Adj</th>
                                                {canAdjustPoints && <th className="text-center p-2">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teams.filter(t => t.status === 'approved').map(tt => {
                                                const team = registeredTeams.find(t => t.id === tt.teamId);
                                                const points = calculateTeamPoints(tt.teamId);
                                                const hasAdjustments = points.adjustmentPoints !== 0;
                                                return (
                                                    <tr key={tt.id} className="border-t">
                                                        <td className="p-2 font-medium">{team?.name}</td>
                                                        <td className="p-2 text-center">0</td>
                                                        <td className="p-2 text-center">0</td>
                                                        <td className="p-2 text-center">0</td>
                                                        <td className="p-2 text-center">0.00</td>
                                                        <td className="p-2 text-center font-bold">{points.total}</td>
                                                        <td className="p-2 text-center">
                                                            {hasAdjustments ? (
                                                                <button
                                                                    onClick={() => handleOpenAuditDialog(tt.teamId)}
                                                                    className={`text-xs font-bold underline cursor-pointer ${points.adjustmentPoints > 0 ? 'text-green-600' : 'text-red-600'
                                                                        }`}
                                                                >
                                                                    {points.adjustmentPoints > 0 ? '+' : ''}{points.adjustmentPoints}
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                        </td>
                                                        {canAdjustPoints && (
                                                            <td className="p-2 text-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenAdjustmentDialog(tt.teamId, team?.name || 'Unknown')}
                                                                >
                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                    Adjust
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-4 italic">
                                    * Points and NRR are updated automatically after match completion. "Adj" shows manual point adjustments.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Points Override Dialog */}
                {selectedTeamForAdjustment && (
                    <PointsOverrideDialog
                        open={adjustmentDialogOpen}
                        onOpenChange={setAdjustmentDialogOpen}
                        tournamentId={tournamentId!}
                        teamId={selectedTeamForAdjustment.id}
                        teamName={selectedTeamForAdjustment.name}
                        onSuccess={refreshData}
                    />
                )}

                {/* Audit Trail Dialog */}
                <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Point Adjustment History</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[500px] overflow-y-auto py-4">
                            <AdjustmentAuditTrail adjustments={selectedTeamAdjustments} />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Rejection Dialog */}
                <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to reject this team? Please provide a reason.
                            </p>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rejection Reason</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="e.g. Incomplete Roster, Fees not paid..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <Button variant="destructive" className="w-full" onClick={handleRejectSubmit}>
                                Confirm Rejection
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default TournamentManagePage;
