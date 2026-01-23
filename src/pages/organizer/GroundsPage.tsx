import React from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Plus, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '@/services/mockDatabase';

const GroundsPage: React.FC = () => {
    const navigate = useNavigate();
    const grounds = mockDB.getGrounds();

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Manage Grounds" />

            <main className="px-4 py-6 max-w-lg mx-auto space-y-4">

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Your Grounds</h2>
                        <p className="text-xs text-muted-foreground">Manage locations for your matches</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/organizer/grounds/add')}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                {grounds.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-dashed hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => navigate('/organizer/grounds/add')}>
                        <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium">No Grounds Added</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add a ground to schedule matches</p>
                        <Button size="sm" variant="outline">Add First Ground</Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {grounds.map(ground => (
                            <Card key={ground.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-4 flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{ground.name}</h3>
                                                <p className="text-xs text-muted-foreground">{ground.location}, {ground.city}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {ground.hourlyFee ? (
                                                <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    <DollarSign className="w-3 h-3 mr-0.5" />
                                                    {ground.hourlyFee}/hr
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Free</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GroundsPage;
