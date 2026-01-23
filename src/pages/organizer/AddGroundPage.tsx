import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { mockDB, Ground } from '@/services/mockDatabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MapPin, Save } from 'lucide-react';

const AddGroundPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Ground>>({
        name: '',
        location: '',
        city: '',
        hourlyFee: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.city) {
            toast.error("Name and City are required");
            return;
        }

        setLoading(true);
        try {
            // In a real app we would call Supabase here
            await mockDB.addGround(formData as any);
            toast.success("Ground Added Successfully");
            navigate('/organizer/grounds');
        } catch (err) {
            toast.error("Failed to add ground");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Add New Ground" />

            <main className="px-4 py-6 max-w-lg mx-auto">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ground Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Shivaji Park"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Area / Location</Label>
                                <Input
                                    id="location"
                                    placeholder="Ex: Dadar West"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        placeholder="Ex: Mumbai"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fee">Hourly Fee (₹)</Label>
                                    <Input
                                        id="fee"
                                        type="number"
                                        placeholder="0"
                                        value={formData.hourlyFee}
                                        onChange={e => setFormData({ ...formData, hourlyFee: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={loading}>
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Save Ground
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AddGroundPage;
