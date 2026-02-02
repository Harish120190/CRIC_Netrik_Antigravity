import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'red';

interface ThemeContextType {
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
        // Try to recover from local storage
        const saved = localStorage.getItem('cric_hub_theme_color');
        return (saved as ThemeColor) || 'blue';
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove previous data attribute if any (though typically we just overwrite)
        root.setAttribute('data-theme-color', themeColor);

        // Persist
        localStorage.setItem('cric_hub_theme_color', themeColor);
    }, [themeColor]);

    return (
        <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
