import React, { useState, useEffect } from 'react';
import { Trophy, MapPin, Calendar, Users, Target, IndianRupee, Gift, FileText, Shield } from 'lucide-react';
import { TournamentFormData } from '@/pages/CreateTournamentPage';
import { supabase } from '@/integrations/supabase/client';

interface TournamentReviewProps {
  formData: TournamentFormData;
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

const TournamentReview: React.FC<TournamentReviewProps> = ({ formData }) => {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (formData.selectedTeamIds.length === 0) return;

      const { data } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .in('id', formData.selectedTeamIds);

      if (data) setSelectedTeams(data);
    };

    fetchTeams();
  }, [formData.selectedTeamIds]);

  const getStageLabel = () => {
    switch (formData.stageType) {
      case 'league':
        return 'League (Round Robin)';
      case 'knockout':
        return 'Knockout';
      case 'group_knockout':
        return `Groups (${formData.groupCount}) + Knockout`;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ 
    icon: Icon, 
    label, 
    value 
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Review Tournament</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm the details before creating</p>
      </div>

      {/* Tournament Name */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-2xl font-bold text-foreground text-center mb-1">
          {formData.name || 'Untitled Tournament'}
        </h3>
        {formData.venue && (
          <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            {formData.venue}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        <div className="px-4">
          <InfoRow icon={Calendar} label="Start Date" value={formatDate(formData.startDate)} />
          <InfoRow icon={Calendar} label="End Date" value={formatDate(formData.endDate)} />
          <InfoRow icon={Target} label="Format" value={`${formData.format} (${formData.overs} overs)`} />
          <InfoRow icon={Users} label="Stage" value={getStageLabel()} />
          <InfoRow icon={Users} label="Teams" value={`${formData.selectedTeamIds.length} / ${formData.maxTeams}`} />
          {formData.entryFee > 0 && (
            <InfoRow icon={IndianRupee} label="Entry Fee" value={`₹${formData.entryFee}`} />
          )}
          {formData.prizePool && (
            <InfoRow icon={Gift} label="Prize Pool" value={formData.prizePool} />
          )}
        </div>
      </div>

      {/* Registered Teams */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Registered Teams ({selectedTeams.length})
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {selectedTeams.map((team, index) => (
            <div
              key={team.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden text-sm font-bold text-muted-foreground">
                {team.logo_url ? (
                  <img src={team.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-sm font-medium text-foreground truncate">{team.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      {formData.rules && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Rules & Regulations
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.rules}</p>
        </div>
      )}
    </div>
  );
};

export default TournamentReview;
