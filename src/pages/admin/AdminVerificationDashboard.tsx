import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Search, UserCheck } from 'lucide-react';
import { mockDB, User } from '@/services/mockDatabase';
import { useToast } from '@/hooks/use-toast';

const AdminVerificationDashboard: React.FC = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<'flagged' | 'pending' | 'verified' | 'all'>('flagged');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const allUsers = mockDB.getUsers();
        setUsers(allUsers);
    };

    const getFilteredUsers = () => {
        switch (filter) {
            case 'flagged':
                return users.filter(u => u.verificationStatus === 'flagged');
            case 'pending':
                return users.filter(u => u.verificationStatus === 'pending_review' || u.verificationStatus === 'pending_photo');
            case 'verified':
                return users.filter(u => u.verificationStatus === 'verified');
            default:
                return users;
        }
    };

    const handleAction = (userId: string, action: 'approve' | 'reject') => {
        try {
            const updates: Partial<User> = {
                verificationStatus: action === 'approve' ? 'verified' : 'rejected',
                // If rejected, maybe clear the photo? For now, just mark rejected.
            };

            mockDB.updateUser(userId, updates);

            toast({
                title: action === 'approve' ? "Player Verified" : "Player Rejected",
                description: `User has been ${action === 'approve' ? 'approved' : 'blocked'} successfully.`,
                variant: action === 'approve' ? "default" : "destructive"
            });

            loadUsers(); // Refresh list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user status",
                variant: "destructive"
            });
        }
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
            case 'flagged':
                return <Badge className="bg-red-100 text-red-800 border-red-200 flex gap-1 items-center"><AlertTriangle className="h-3 w-3" /> Flagged</Badge>;
            case 'pending_review':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Review</Badge>;
            case 'rejected':
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">Pending Photo</Badge>;
        }
    };

    const filteredUsers = getFilteredUsers();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Verification Console" showSearch={false} />

            <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Player Verification</h1>
                        <p className="text-sm text-gray-500">Review flagged identities and manage approvals.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadUsers}>Refresh Data</Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Stats Cards */}
                    <Card className="flex-1 border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Conflicts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.filter(u => u.verificationStatus === 'flagged').length}</div>
                            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Players</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.filter(u => u.verificationStatus === 'verified').length}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Photos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.filter(u => !u.verificationStatus || u.verificationStatus === 'pending_photo').length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="flagged" onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
                        <TabsTrigger value="flagged">Flagged</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="verified">Verified</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="mt-6">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No players found</h3>
                                <p className="text-gray-500">There are no players with {filter} status.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredUsers.map(user => (
                                    <Card key={user.id} className="overflow-hidden">
                                        <CardHeader className="pb-2 bg-gray-50/50">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="bg-white">
                                                    #{user.jerseyNumber || 'N/A'}
                                                </Badge>
                                                <StatusBadge status={user.verificationStatus} />
                                            </div>
                                            <CardTitle className="mt-2 text-lg">{user.fullName}</CardTitle>
                                            <CardDescription>{user.mobile}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                                                    {user.faceEmbeddingUrl ? (
                                                        <img src={user.faceEmbeddingUrl} alt="Player" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            No Photo
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    {user.flagReason && (
                                                        <div className="bg-red-50 p-2 rounded text-xs text-red-800 border border-red-100">
                                                            <strong>Alert:</strong> {user.flagReason}
                                                        </div>
                                                    )}
                                                    {user.verificationConfidence !== undefined && (
                                                        <div className="text-xs text-gray-500">
                                                            AI Confidence: <span className="font-medium">{user.verificationConfidence}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    size="sm"
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1"
                                                    size="sm"
                                                    onClick={() => handleAction(user.id, 'reject')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" /> Ban
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminVerificationDashboard;
