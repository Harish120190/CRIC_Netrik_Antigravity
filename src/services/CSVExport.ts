import { mockDB } from "./mockDatabase";

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const val = row[header];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportAllData = () => {
    exportToCSV(mockDB.getMatches(), 'matches_backup.csv');
    exportToCSV(mockDB.getTeams(), 'teams_backup.csv');
    exportToCSV(mockDB.getTournaments(), 'tournaments_backup.csv');
    exportToCSV(mockDB.getGrounds(), 'grounds_backup.csv');
};
