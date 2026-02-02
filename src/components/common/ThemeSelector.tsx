import React from 'react';
import { useTheme, ThemeColor } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

export const ThemeSelector: React.FC = () => {
    const { themeColor, setThemeColor } = useTheme();

    const themes: { id: ThemeColor; name: string; color: string }[] = [
        { id: 'blue', name: 'Modern Blue', color: 'bg-blue-600' },
        { id: 'green', name: 'Cricket Green', color: 'bg-green-600' },
        { id: 'orange', name: 'Sunset Orange', color: 'bg-orange-600' },
        { id: 'purple', name: 'Royal Purple', color: 'bg-purple-600' },
        { id: 'teal', name: 'Ocean Teal', color: 'bg-teal-600' },
        { id: 'red', name: 'Power Red', color: 'bg-pink-600' },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => setThemeColor(theme.id)}
                    className={cn(
                        "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all hover:bg-accent/5",
                        themeColor === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-card shadow-sm hover:border-border"
                    )}
                >
                    <div className={cn("h-8 w-8 rounded-full mb-2 flex items-center justify-center", theme.color)}>
                        {themeColor === theme.id && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{theme.name}</span>
                </button>
            ))}
        </div>
    );
};
