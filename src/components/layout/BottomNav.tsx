import React from 'react';
import { Home, Users, Trophy, Search, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPath, onNavigate }) => {
  const navItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Looking', path: '/looking' },
    { icon: <Trophy className="w-6 h-6" />, label: 'MyCricket', path: '/matches' },
    { icon: <Users className="w-5 h-5" />, label: 'Community', path: '/community' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Store', path: '/store' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const isCenter = item.path === '/matches';

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                isCenter
                  ? "relative -mt-4 w-14 h-14 rounded-full gradient-pitch shadow-glow text-primary-foreground"
                  : "w-16 h-full",
                !isCenter && isActive && "text-primary",
                !isCenter && !isActive && "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              {!isCenter && (
                <span className="text-[10px] font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
