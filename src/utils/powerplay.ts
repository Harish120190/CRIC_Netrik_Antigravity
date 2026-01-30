export type PowerplayPhase = 'P1' | 'P2' | 'P3' | 'None';

export interface PowerplayRule {
    phase: PowerplayPhase;
    startOver: number;
    endOver: number;
    maxFieldersOutside: number;
    label: string;
}

export const getPowerplayRules = (totalOvers: number): PowerplayRule[] => {
    if (totalOvers >= 50) {
        // Standard ODI rules
        return [
            { phase: 'P1', startOver: 0, endOver: 10, maxFieldersOutside: 2, label: 'Mandatory Powerplay' },
            { phase: 'P2', startOver: 10, endOver: 40, maxFieldersOutside: 4, label: 'Middle Overs' },
            { phase: 'P3', startOver: 40, endOver: 50, maxFieldersOutside: 5, label: 'Death Overs' },
        ];
    } else if (totalOvers >= 20) {
        // Standard T20 rules
        return [
            { phase: 'P1', startOver: 0, endOver: 6, maxFieldersOutside: 2, label: 'Powerplay' },
            { phase: 'None', startOver: 6, endOver: totalOvers, maxFieldersOutside: 5, label: 'Non-Powerplay' },
        ];
    } else if (totalOvers >= 10) {
        // T10 rules
        return [
            { phase: 'P1', startOver: 0, endOver: 3, maxFieldersOutside: 2, label: 'Powerplay' },
            { phase: 'None', startOver: 3, endOver: totalOvers, maxFieldersOutside: 5, label: 'Non-Powerplay' },
        ];
    } else {
        // Default / Custom short matches
        const ppLimit = Math.max(1, Math.floor(totalOvers * 0.3));
        return [
            { phase: 'P1', startOver: 0, endOver: ppLimit, maxFieldersOutside: 2, label: 'Powerplay' },
            { phase: 'None', startOver: ppLimit, endOver: totalOvers, maxFieldersOutside: 5, label: 'Non-Powerplay' },
        ];
    }
};

export const getCurrentPowerplay = (currentOver: number, totalOvers: number): PowerplayRule | null => {
    const rules = getPowerplayRules(totalOvers);
    return rules.find(r => currentOver >= r.startOver && currentOver < r.endOver) || null;
};
