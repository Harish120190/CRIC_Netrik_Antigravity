import React from 'react';
import { Calendar, MapPin, Trophy, IndianRupee, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TournamentFormData } from '@/pages/CreateTournamentPage';

interface TournamentBasicInfoProps {
  formData: TournamentFormData;
  updateFormData: (updates: Partial<TournamentFormData>) => void;
}

const TournamentBasicInfo: React.FC<TournamentBasicInfoProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Tournament Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter basic information about your tournament</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-foreground">
            Tournament Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="e.g., Sunday League Championship"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="venue" className="text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Venue / Location
          </Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => updateFormData({ venue: e.target.value })}
            placeholder="e.g., Mumbai Cricket Ground"
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-foreground">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryFee" className="text-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Entry Fee
            </Label>
            <Input
              id="entryFee"
              type="number"
              min="0"
              value={formData.entryFee}
              onChange={(e) => updateFormData({ entryFee: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="prizePool" className="text-foreground">
              Prize Pool
            </Label>
            <Input
              id="prizePool"
              value={formData.prizePool}
              onChange={(e) => updateFormData({ prizePool: e.target.value })}
              placeholder="e.g., ₹50,000"
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="rules" className="text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Rules & Regulations
          </Label>
          <Textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => updateFormData({ rules: e.target.value })}
            placeholder="Enter tournament rules..."
            rows={4}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
};

export default TournamentBasicInfo;
