import React from 'react';
import { Bell, Search } from 'lucide-react';
import { CricketBat } from '@/components/icons/CricketIcons';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Cric Netrik',
  showSearch = true,
  showNotifications = true 
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-pitch flex items-center justify-center shadow-glow">
            <CricketBat className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="w-5 h-5" />
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-live rounded-full" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
