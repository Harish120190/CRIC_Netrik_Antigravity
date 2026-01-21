import React, { useState } from 'react';
import { MapPin, Search, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface VenuePickerProps {
  selectedVenue: string;
  onSelectVenue: (venue: string) => void;
}

const popularVenues = [
  { name: 'Central Park Cricket Ground', location: 'Mumbai', recent: true },
  { name: 'Green Field Stadium', location: 'Delhi', recent: true },
  { name: 'Sports Complex Ground', location: 'Bangalore', recent: false },
  { name: 'City Cricket Club', location: 'Chennai', recent: false },
  { name: 'Riverside Cricket Ground', location: 'Kolkata', recent: false },
  { name: 'University Sports Ground', location: 'Hyderabad', recent: false },
];

const VenuePicker: React.FC<VenuePickerProps> = ({ selectedVenue, onSelectVenue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customVenue, setCustomVenue] = useState('');

  const filteredVenues = popularVenues.filter(
    venue => 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentVenues = filteredVenues.filter(v => v.recent);
  const otherVenues = filteredVenues.filter(v => !v.recent);

  const handleCustomVenue = () => {
    if (customVenue.trim()) {
      onSelectVenue(customVenue.trim());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Select Venue</h2>
        <p className="text-muted-foreground">Where will the match be played?</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search venues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Custom Venue Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Or enter a custom venue..."
          value={customVenue}
          onChange={(e) => setCustomVenue(e.target.value)}
          onBlur={handleCustomVenue}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomVenue()}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Selected Venue Display */}
      {selectedVenue && (
        <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Selected venue</p>
            <p className="font-semibold text-foreground">{selectedVenue}</p>
          </div>
          <Star className="w-5 h-5 text-gold fill-gold" />
        </div>
      )}

      {/* Recent Venues */}
      {recentVenues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </div>
          <div className="space-y-2">
            {recentVenues.map((venue) => (
              <button
                key={venue.name}
                onClick={() => onSelectVenue(venue.name)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left",
                  selectedVenue === venue.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-pitch/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pitch" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other Venues */}
      {otherVenues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>Popular venues</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {otherVenues.map((venue) => (
              <button
                key={venue.name}
                onClick={() => onSelectVenue(venue.name)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left",
                  selectedVenue === venue.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VenuePicker;
