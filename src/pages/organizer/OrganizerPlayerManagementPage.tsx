import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Users, CheckCircle2, XCircle, Ban, TrendingUp, Shield } from 'lucide-react';
import { mockDB } from '@/services/mockDatabase';
import { getPlayerTrustProfile, getTrustLevelColor, getTrustLevelBgColor } from '@/services/trustScoreService';
import PlayerTrustScoreCard from '@/components/organizer/PlayerTrustScoreCard';
import PlayerVerificationHistory from '@/components/organizer/PlayerVerificationHistory';
import ProxyFlagsList from '@/components/organizer/ProxyFlagsList';
import PlayerActionPanel from '@/components/organizer/PlayerActionPanel';
import type { PlayerTrustProfile, PlayerStatus } from '@/types/proxyPrevention';

const OrganizerPlayerManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [players, setPlayers] = useState<any[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PlayerStatus | 'all'>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerTrustProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock organizer ID - in real app, get from auth context
    const organizerId = 'organizer-1';

    useEffect(() => {
        loadTournaments();
    }, []);

    useEffect(() => {
        if (selectedTournament) {
            loadPlayers();
        }
    }, [selectedTournament]);

    useEffect(() => {
        filterPlayers();
    }, [players, searchQuery, statusFilter]);

    const loadTournaments = () => {
        const allTournaments = mockDB.getTournaments();
        setTournaments(allTournaments);
        if (allTournaments.length > 0) {
            setSelectedTournament(allTournaments[0].id);
        }
        setLoading(false);
    };

    const loadPlayers = () => {
        const allUsers = mockDB.getUsers();
        const playerUsers = allUsers.filter(u => u.role === 'player');

        // Get player statuses for this tournament
        const statuses = mockDB.getTournamentPlayerStatuses(selectedTournament);

        const playersWithProfiles = playerUsers.map(user => {
            const profile = getPlayerTrustProfile(user.id);
            const status = statuses.find(s => s.userId === user.id);

            return {
                ...user,
                trustProfile: profile,
                tournamentStatus: status?.status || 'pending'
            };
        });

        setPlayers(playersWithProfiles);
    };

    const filterPlayers = () => {
        let filtered = [...players];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.fullName.toLowerCase().includes(query) ||
                p.email?.toLowerCase().includes(query) ||
                p.mobile.includes(query)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.tournamentStatus === statusFilter);
        }

        setFilteredPlayers(filtered);
    };

    const getStats = () => {
        const total = players.length;
        const pending = players.filter(p => p.tournamentStatus === 'pending').length;
        const approved = players.filter(p => p.tournamentStatus === 'approved').length;
        const rejected = players.filter(p => p.tournamentStatus === 'rejected').length;
        const banned = players.filter(p => p.tournamentStatus === 'banned').length;

        const avgTrustScore = players.length > 0
            ? players.reduce((sum, p) => sum + (p.trustProfile?.trustScore || 0), 0) / players.length
            : 0;

        const highRisk = players.filter(p => (p.trustProfile?.trustScore || 0) < 30).length;

        return { total, pending, approved, rejected, banned, avgTrustScore, highRisk };
    };

    const stats = getStats();

    const handlePlayerClick = (player: any) => {
        if (player.trustProfile) {
            setSelectedPlayer(player.trustProfile);
        }
    };

    const handleStatusChange = () => {
        loadPlayers();
        setSelectedPlayer(null);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/organizer/dashboard')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Player Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage player trust scores and tournament participation
                        </p>
                    </div>
                </div>
            </div>

            {/* Tournament Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Tournament</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a tournament" />
                        </SelectTrigger>
                        <SelectContent>
                            {tournaments.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Total Players</p>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-yellow-600" />
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="text-xs text-muted-foreground">Approved</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-muted-foreground">Rejected</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Ban className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-muted-foreground">Banned</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{stats.banned}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-muted-foreground">Avg Trust</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.avgTrustScore.toFixed(0)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-muted-foreground">High Risk</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or mobile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Players List */}
            <Card>
                <CardHeader>
                    <CardTitle>Players ({filteredPlayers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredPlayers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No players found
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filteredPlayers.map(player => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => handlePlayerClick(player)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-bold text-primary">
                                                {player.fullName.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{player.fullName}</h3>
                                            <p className="text-sm text-muted-foreground">{player.mobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Trust Score */}
                                        {player.trustProfile && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">{player.trustProfile.trustScore}</p>
                                                <Badge className={`${getTrustLevelBgColor(player.trustProfile.trustLevel)} ${getTrustLevelColor(player.trustProfile.trustLevel)} border-0 text-xs`}>
                                                    {player.trustProfile.trustLevel}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <Badge
                                            variant={
                                                player.tournamentStatus === 'approved' ? 'default' :
                                                    player.tournamentStatus === 'rejected' ? 'destructive' :
                                                        player.tournamentStatus === 'banned' ? 'destructive' :
                                                            'secondary'
                                            }
                                        >
                                            {player.tournamentStatus}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Player Details Dialog */}
            <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Player Details</DialogTitle>
                    </DialogHeader>

                    {selectedPlayer && (
                        <div className="space-y-6">
                            {/* Player Info */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-primary">
                                                {mockDB.getUsers().find(u => u.id === selectedPlayer.userId)?.fullName.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">
                                                {mockDB.getUsers().find(u => u.id === selectedPlayer.userId)?.fullName}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {mockDB.getUsers().find(u => u.id === selectedPlayer.userId)?.mobile}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <PlayerTrustScoreCard profile={selectedPlayer} />
                                    <PlayerVerificationHistory history={selectedPlayer.verificationHistory} />
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <ProxyFlagsList flags={selectedPlayer.proxyFlags} />
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <PlayerActionPanel
                                                userId={selectedPlayer.userId}
                                                tournamentId={selectedTournament}
                                                organizerId={organizerId}
                                                currentStatus={players.find(p => p.id === selectedPlayer.userId)?.tournamentStatus}
                                                onStatusChange={handleStatusChange}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrganizerPlayerManagementPage;
