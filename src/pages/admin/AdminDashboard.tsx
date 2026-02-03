import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    Trophy,
    Shield,
    FileText,
    Settings,
    Database,
    UserCheck,
    BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDB } from '@/services/mockDatabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTournaments: 0,
        totalTeams: 0,
        totalMatches: 0,
        pendingVerifications: 0,
    });

    useEffect(() => {
        if (!isAdmin) {
            toast.error('Access denied. Admin privileges required.');
            navigate('/');
            return;
        }

        // Load stats
        const users = mockDB.getUsers();
        const tournaments = mockDB.getTournaments();
        const teams = mockDB.getTeams();
        const matches = mockDB.getMatches();

        setStats({
            totalUsers: users.length,
            totalTournaments: tournaments.length,
            totalTeams: teams.length,
            totalMatches: matches.length,
            pendingVerifications: users.filter(u => !u.isMobileVerified).length,
        });
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        return null;
    }

    const adminFeatures = [
        {
            title: 'User Management',
            description: 'View and manage all users',
            icon: Users,
            path: '/admin/users',
            color: 'bg-blue-500',
            stat: stats.totalUsers,
        },
        {
            title: 'Tournament Management',
            description: 'Manage all tournaments',
            icon: Trophy,
            path: '/admin/tournaments',
            color: 'bg-green-500',
            stat: stats.totalTournaments,
        },
        {
            title: 'Team Management',
            description: 'View and manage teams',
            icon: Shield,
            path: '/admin/teams',
            color: 'bg-purple-500',
            stat: stats.totalTeams,
        },
        {
            title: 'Verification Dashboard',
            description: 'Player verification system',
            icon: UserCheck,
            path: '/admin/verification',
            color: 'bg-yellow-500',
            stat: stats.pendingVerifications,
        },
        {
            title: 'CSV Data Manager',
            description: 'Import and export data',
            icon: Database,
            path: '/csv-manager',
            color: 'bg-indigo-500',
            stat: null,
        },
        {
            title: 'System Reports',
            description: 'Analytics and reports',
            icon: BarChart3,
            path: '/admin/reports',
            color: 'bg-red-500',
            stat: stats.totalMatches,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.fullName}. Manage your cricket platform.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTournaments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teams</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTeams}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Matches</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMatches}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={feature.path}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(feature.path)}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                                            <Icon className={`w-6 h-6 ${feature.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        {feature.stat !== null && (
                                            <span className="text-2xl font-bold text-muted-foreground">
                                                {feature.stat}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full">
                                        Open
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* System Info */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Application</p>
                                <p className="font-semibold">cric.netrik v1.0</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Admin User</p>
                                <p className="font-semibold">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Role</p>
                                <p className="font-semibold capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
