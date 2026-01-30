import React from 'react';
import { Bell, Search, MessageCircle } from 'lucide-react';
import { CricketBat } from '@/components/icons/CricketIcons';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMessages?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Cric Netrik',
  showSearch = true,
  showNotifications = true,
  showMessages = true
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <CricketBat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">{title}</h1>
            <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-300" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl">
              <Search className="w-5 h-5" />
            </Button>
          )}
          {showMessages && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl relative overflow-visible">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent border-2 border-background rounded-full live-pulse" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
