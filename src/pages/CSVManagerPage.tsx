import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Download,
    Upload,
    FileText,
    Users,
    Trophy,
    MapPin,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
    exportUsersToCSV,
    exportTeamsToCSV,
    exportTournamentsToCSV,
    exportTournamentTeamsToCSV,
    exportMatchesToCSV,
    exportGroundsToCSV,
    exportAllData,
    downloadCSV,
    importUsersFromCSV,
    importTeamsFromCSV,
    importTournamentsFromCSV,
    importGroundsFromCSV
} from '@/services/csvService';

export default function CSVManager() {
    const { user } = useAuth();
    const [importResult, setImportResult] = useState<{ success: boolean; count: number; errors: string[] } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExport = (type: string) => {
        try {
            switch (type) {
                case 'users':
                    downloadCSV(exportUsersToCSV(), 'users.csv');
                    break;
                case 'teams':
                    downloadCSV(exportTeamsToCSV(), 'teams.csv');
                    break;
                case 'tournaments':
                    downloadCSV(exportTournamentsToCSV(), 'tournaments.csv');
                    break;
                case 'tournament_teams':
                    downloadCSV(exportTournamentTeamsToCSV(), 'tournament_teams.csv');
                    break;
                case 'matches':
                    downloadCSV(exportMatchesToCSV(), 'matches.csv');
                    break;
                case 'grounds':
                    downloadCSV(exportGroundsToCSV(), 'grounds.csv');
                    break;
                case 'all':
                    exportAllData();
                    break;
            }
            toast.success(`${type === 'all' ? 'All data' : type} exported successfully!`);
        } catch (error) {
            toast.error('Failed to export data');
            console.error(error);
        }
    };

    const handleImport = async (type: string, file: File) => {
        if (!user) {
            toast.error('Please login to import data');
            return;
        }

        setIsProcessing(true);
        setImportResult(null);

        try {
            const text = await file.text();
            let result;

            switch (type) {
                case 'users':
                    result = importUsersFromCSV(text);
                    break;
                case 'teams':
                    result = importTeamsFromCSV(text, user.id);
                    break;
                case 'tournaments':
                    result = importTournamentsFromCSV(text, user.id);
                    break;
                case 'grounds':
                    result = importGroundsFromCSV(text);
                    break;
                default:
                    throw new Error('Invalid import type');
            }

            setImportResult(result);

            if (result.success) {
                toast.success(`Successfully imported ${result.count} ${type}`);
            } else {
                toast.error(`Import completed with ${result.errors.length} errors`);
            }
        } catch (error: any) {
            toast.error('Failed to import data: ' + error.message);
            setImportResult({ success: false, count: 0, errors: [error.message] });
        } finally {
            setIsProcessing(false);
        }
    };

    const FileUploadSection = ({ type, label, icon: Icon }: { type: string; label: string; icon: any }) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {label}
                </CardTitle>
                <CardDescription>Import {label.toLowerCase()} from CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`import-${type}`}>Select CSV File</Label>
                    <Input
                        id={`import-${type}`}
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImport(type, file);
                        }}
                        disabled={isProcessing}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => handleExport(type)}
                    className="w-full gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">CSV Data Manager</h1>
                <p className="text-muted-foreground">
                    Import and export data using CSV files
                </p>
            </div>

            {importResult && (
                <Alert className={importResult.success ? 'border-green-500' : 'border-destructive'}>
                    {importResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                        <div className="font-semibold mb-2">
                            {importResult.success
                                ? `Successfully imported ${importResult.count} records`
                                : `Import failed with ${importResult.errors.length} errors`}
                        </div>
                        {importResult.errors.length > 0 && (
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {importResult.errors.slice(0, 5).map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                                {importResult.errors.length > 5 && (
                                    <li>...and {importResult.errors.length - 5} more errors</li>
                                )}
                            </ul>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="import" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="import">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                    </TabsTrigger>
                    <TabsTrigger value="export">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="import" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadSection type="users" label="Users" icon={Users} />
                        <FileUploadSection type="teams" label="Teams" icon={Users} />
                        <FileUploadSection type="tournaments" label="Tournaments" icon={Trophy} />
                        <FileUploadSection type="grounds" label="Grounds" icon={MapPin} />
                    </div>
                </TabsContent>

                <TabsContent value="export" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Export Data</CardTitle>
                            <CardDescription>
                                Download your data as CSV files for backup or analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={() => handleExport('all')}
                                className="w-full gap-2"
                                size="lg"
                            >
                                <Download className="w-4 h-4" />
                                Export All Data
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('users')}
                                    className="gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Users
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('teams')}
                                    className="gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Teams
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('tournaments')}
                                    className="gap-2"
                                >
                                    <Trophy className="w-4 h-4" />
                                    Tournaments
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('tournament_teams')}
                                    className="gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Tournament Teams
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('matches')}
                                    className="gap-2"
                                >
                                    <Trophy className="w-4 h-4" />
                                    Matches
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('grounds')}
                                    className="gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Grounds
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
