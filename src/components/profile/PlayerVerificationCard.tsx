import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, ShieldCheck, AlertTriangle, User, Shirt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FaceVerificationService, VerificationResult } from '@/services/FaceVerificationService';
import { toast } from 'sonner';

export const PlayerVerificationCard: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [jerseyNum, setJerseyNum] = useState(user?.jerseyNumber || '');
    const [isUploading, setIsUploading] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

    const handleJerseySave = async () => {
        if (!jerseyNum) return;
        try {
            await updateProfile({ jerseyNumber: jerseyNum });
            toast.success("Jersey number updated!");
        } catch (e) {
            toast.error("Failed to save jersey number");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setVerificationResult(null);

        try {
            // 1. Check for duplicates (AI Check)
            const result = await FaceVerificationService.checkForDuplicates(file, user.id);
            setVerificationResult(result);

            if (result.isClean) {
                // 2. Mock generating embedding ID
                const embeddingId = await FaceVerificationService.generateEmbedding(file);
                const base64Img = await FaceVerificationService.fileToBase64(file);

                // 3. Update User Profile
                await updateProfile({
                    faceEmbeddingId: embeddingId,
                    faceEmbeddingUrl: base64Img,
                    verificationStatus: 'verified',
                    verificationConfidence: 100,
                    flagReason: undefined
                });
                toast.success("Identity Verified! Photo registered.");
            } else {
                // Flag the user
                await updateProfile({
                    verificationStatus: 'flagged',
                    verificationConfidence: result.confidence,
                    flagReason: result.message
                });
                toast.error("Verification Failed: Potential Duplicate Detected.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error processing verification photo");
        } finally {
            setIsUploading(false);
        }
    };

    const statusColor = {
        'verified': 'bg-green-100 text-green-800 border-green-200',
        'flagged': 'bg-red-100 text-red-800 border-red-200',
        'pending_photo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'rejected': 'bg-red-100 text-red-800 border-red-200',
        'pending_review': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const currentStatus = user?.verificationStatus || 'pending_photo';

    return (
        <Card className="mb-6 border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-900">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Player Identity Card
                    </CardTitle>
                    <Badge variant="outline" className={statusColor[currentStatus]}>
                        {currentStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <CardDescription>
                    Required for tournament participation
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* 1. Jersey Number */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <Shirt className="h-4 w-4 text-muted-foreground" />
                        Jersey Number
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. 18"
                            value={jerseyNum}
                            onChange={(e) => setJerseyNum(e.target.value)}
                            className="max-w-[100px]"
                        />
                        <Button variant="outline" size="sm" onClick={handleJerseySave}>
                            Save
                        </Button>
                    </div>
                </div>

                {/* 2. Photo Verification */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Identity Verification
                    </Label>

                    {user?.faceEmbeddingUrl ? (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                            <img
                                src={user.faceEmbeddingUrl}
                                alt="Registered Face"
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Photo Registered</p>
                                <p className="text-xs text-muted-foreground">Used for match-day verification</p>
                            </div>
                            {currentStatus === 'flagged' && (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="photo-upload"
                                onChange={handlePhotoUpload}
                                disabled={isUploading}
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                ) : (
                                    <Upload className="h-8 w-8 text-slate-400" />
                                )}
                                <span className="text-sm font-medium text-slate-600">
                                    {isUploading ? "Verifying..." : "Upload Face Photo"}
                                </span>
                                <span className="text-xs text-slate-400">
                                    Selfie or Front-facing photo
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Verification Result Feedback */}
                    {verificationResult && !verificationResult.isClean && (
                        <Alert variant="destructive" className="mt-2 bg-red-50 border-red-200 text-red-900">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Verification Alert</AlertTitle>
                            <AlertDescription>
                                {verificationResult.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {currentStatus === 'flagged' && !verificationResult && user?.flagReason && (
                        <Alert variant="destructive" className="mt-2 bg-red-50 border-red-200 text-red-900">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Under Review</AlertTitle>
                            <AlertDescription>
                                {user.flagReason}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

            </CardContent>
        </Card>
    );
};
