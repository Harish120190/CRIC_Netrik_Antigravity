import React from 'react';
import { Target, Users, Layers } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TournamentFormData } from '@/pages/CreateTournamentPage';
import { cn } from '@/lib/utils';

interface TournamentFormatConfigProps {
  formData: TournamentFormData;
  updateFormData: (updates: Partial<TournamentFormData>) => void;
}

const formatOptions = [
  { value: 'T10', label: 'T10', overs: 10, description: 'Quick 10-over format' },
  { value: 'T20', label: 'T20', overs: 20, description: 'Twenty20 cricket' },
  { value: 'ODI', label: 'ODI', overs: 50, description: '50-over one-day format' },
  { value: 'Custom', label: 'Custom', overs: null, description: 'Set custom overs' },
];

const stageOptions = [
  { 
    value: 'league', 
    label: 'League', 
    icon: Target,
    description: 'Round-robin format where everyone plays each other' 
  },
  { 
    value: 'knockout', 
    label: 'Knockout', 
    icon: Layers,
    description: 'Single elimination tournament' 
  },
  { 
    value: 'group_knockout', 
    label: 'Group + Knockout', 
    icon: Users,
    description: 'Group stage followed by knockout rounds' 
  },
];

const TournamentFormatConfig: React.FC<TournamentFormatConfigProps> = ({ formData, updateFormData }) => {
  const handleFormatChange = (format: string) => {
    const selectedFormat = formatOptions.find(f => f.value === format);
    updateFormData({ 
      format: format as TournamentFormData['format'],
      overs: selectedFormat?.overs || formData.overs
    });
  };

  const handleStageChange = (stageType: string) => {
    const stage = stageType as TournamentFormData['stageType'];
    let updates: Partial<TournamentFormData> = { stageType: stage };
    
    // Auto-calculate based on stage type
    if (stage === 'group_knockout') {
      updates.groupCount = 2;
      updates.teamsPerGroup = Math.floor(formData.maxTeams / 2);
    }
    
    updateFormData(updates);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Target className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Match Format</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure the match and tournament format</p>
      </div>

      {/* Match Format */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold">Match Format</Label>
        <div className="grid grid-cols-4 gap-2">
          {formatOptions.map((format) => (
            <button
              key={format.value}
              onClick={() => handleFormatChange(format.value)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center",
                formData.format === format.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="block text-lg font-bold">{format.label}</span>
              {format.overs && (
                <span className="text-xs text-muted-foreground">{format.overs} overs</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Overs */}
      {formData.format === 'Custom' && (
        <div>
          <Label htmlFor="overs" className="text-foreground">Number of Overs</Label>
          <Input
            id="overs"
            type="number"
            min="1"
            max="50"
            value={formData.overs}
            onChange={(e) => updateFormData({ overs: parseInt(e.target.value) || 20 })}
            className="mt-1.5"
          />
        </div>
      )}

      {/* Tournament Stage Type */}
      <div className="space-y-3">
        <Label className="text-foreground font-semibold">Tournament Stage</Label>
        <RadioGroup
          value={formData.stageType}
          onValueChange={handleStageChange}
          className="space-y-3"
        >
          {stageOptions.map((stage) => {
            const Icon = stage.icon;
            return (
              <label
                key={stage.value}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  formData.stageType === stage.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={stage.value} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Team Configuration */}
      <div className="space-y-4">
        <Label className="text-foreground font-semibold">Team Settings</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxTeams" className="text-sm text-muted-foreground">
              Maximum Teams
            </Label>
            <Input
              id="maxTeams"
              type="number"
              min="2"
              max="32"
              value={formData.maxTeams}
              onChange={(e) => {
                const max = parseInt(e.target.value) || 8;
                updateFormData({ 
                  maxTeams: max,
                  teamsPerGroup: Math.floor(max / formData.groupCount)
                });
              }}
              className="mt-1.5"
            />
          </div>
          {formData.stageType === 'group_knockout' && (
            <div>
              <Label htmlFor="groupCount" className="text-sm text-muted-foreground">
                Number of Groups
              </Label>
              <Input
                id="groupCount"
                type="number"
                min="2"
                max="8"
                value={formData.groupCount}
                onChange={(e) => {
                  const groups = parseInt(e.target.value) || 2;
                  updateFormData({ 
                    groupCount: groups,
                    teamsPerGroup: Math.floor(formData.maxTeams / groups)
                  });
                }}
                className="mt-1.5"
              />
            </div>
          )}
        </div>

        {formData.stageType === 'group_knockout' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              With {formData.groupCount} groups and {formData.maxTeams} teams, each group will have approximately{' '}
              <span className="font-semibold text-foreground">
                {Math.floor(formData.maxTeams / formData.groupCount)} teams
              </span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentFormatConfig;
