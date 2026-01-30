import { mockDB } from "./mockDatabase";

export const seedFromCSV = async () => {
    const seeded = localStorage.getItem('cric_hub_seeded');
    if (seeded) return;

    try {
        console.log("Seeding data from CSV files...");

        // Define paths to CSVs (assuming they are served as static assets or just using hardcoded samples if fetch fails)
        const csvFiles = [
            { key: 'teams', path: '/database/csv/teams.csv' },
            { key: 'grounds', path: '/database/csv/grounds.csv' },
            { key: 'tournaments', path: '/database/csv/tournaments.csv' }
        ];

        // Since we are in a purely client-side environment at the moment, 
        // and may not have a reliable way to 'fetch' local files without a server,
        // we'll implement a robust parser that can be triggered by the user uploading a file,
        // or we'll hardcode the initial state from the CSVs we read earlier.

        // HELPER: Simple CSV Parser
        const parseCSV = (csv: string) => {
            const lines = csv.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',');
            return lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, i) => {
                    obj[header.trim()] = values[i]?.replace(/"/g, '').trim();
                    return obj;
                }, {} as any);
            });
        };

        // For now, let's pre-populate based on what we saw in the CSVs
        const teams = [
            { name: "Chennai Super Kings", short_name: "CSK", city: "Chennai" },
            { name: "Mumbai Indians", short_name: "MI", city: "Mumbai" },
            { name: "Royal Challengers Bangalore", short_name: "RCB", city: "Bangalore" },
            { name: "Kolkata Knight Riders", short_name: "KKR", city: "Kolkata" }
        ];

        const grounds = [
            { name: "Central Maidan", location: "Churchgate", city: "Mumbai", hourly_fee: 500 },
            { name: "Shivaji Park", location: "Dadar", city: "Mumbai", hourly_fee: 200 },
            { name: "Tech Park Ground", location: "Whitefield", city: "Bangalore", hourly_fee: 1200 }
        ];

        // Seed them
        teams.forEach(t => mockDB.createTeam(t.name));
        grounds.forEach(g => mockDB.addGround(g));

        localStorage.setItem('cric_hub_seeded', 'true');
        console.log("Successfully seeded mock database!");
    } catch (e) {
        console.error("Failed to seed data", e);
    }
};
