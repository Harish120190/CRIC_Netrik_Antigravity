import { mockDB } from "./mockDatabase";
import { toast } from "sonner";

export const seedFromCSV = async () => {
    // Legacy support
    await seedDemoData();
};

export const seedDemoData = async () => {
    try {
        console.log("Seeding Demo Data...");

        // 1. Create Teams
        const teams = [
            { name: "Chennai Super Kings", short_name: "CSK", city: "Chennai" },
            { name: "Royal Challengers Bangalore", short_name: "RCB", city: "Bangalore" },
            { name: "Mumbai Indians", short_name: "MI", city: "Mumbai" },
            { name: "Kolkata Knight Riders", short_name: "KKR", city: "Kolkata" }
        ];

        let createdTeams = [];
        for (const t of teams) {
            // Check if exists to avoid duplicates
            const existing = mockDB.getTeams().find(existing => existing.name === t.name);
            if (!existing) {
                createdTeams.push(mockDB.createTeam(t.name));
            } else {
                createdTeams.push(existing);
            }
        }

        // 2. Create Ground
        const grounds = [
            { name: "Chepauk Stadium", location: "Chennai", city: "Chennai", hourly_fee: 5000 },
            { name: "Chinnaswamy Stadium", location: "Bangalore", city: "Bangalore", hourly_fee: 5000 }
        ];

        for (const g of grounds) {
            const existing = mockDB.getGrounds().find(ex => ex.name === g.name);
            if (!existing) {
                mockDB.addGround(g);
            }
        }

        // 3. Schedule a Demo Match (CSK vs RCB)
        const team1 = createdTeams.find(t => t.name === "Chennai Super Kings");
        const team2 = createdTeams.find(t => t.name === "Royal Challengers Bangalore");
        const ground = mockDB.getGrounds()[0]; // Chepauk

        if (team1 && team2) {
            const existingMatch = mockDB.getMatches().find(m =>
                m.team1_name === team1.name &&
                m.team2_name === team2.name &&
                m.status === 'scheduled'
            );

            if (!existingMatch) {
                mockDB.createMatch({
                    team1_id: team1.id,
                    team2_id: team2.id,
                    team1_name: team1.name,
                    team2_name: team2.name,
                    match_date: new Date().toISOString(), // Today
                    match_type: "T20",
                    overs: 2, // Short for demo
                    ground_id: ground?.id || "demo_ground",
                    ground_name: ground?.name || "Demo Ground",
                    city: "Chennai"
                });
                console.log("Demo Match Scheduled: CSK vs RCB");
            }
        }

        localStorage.setItem('cric_hub_seeded', 'true');
        toast.success("Demo Data Populated! Teams and Match created.");

        return true;
    } catch (e) {
        console.error("Failed to seed data", e);
        toast.error("Failed to populate demo data");
        return false;
    }
};
