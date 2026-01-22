
import { mockDB } from '../src/services/mockDatabase';
import { LocalStorage } from 'node-localstorage';

// Polyfill for LocalStorage since we are running in Node environment
if (typeof localStorage === "undefined" || localStorage === null) {
    // @ts-ignore
    global.localStorage = new LocalStorage('./scratch');
}

console.log("Starting Logic Verification Smoke Test...");

try {
    // 1. Test Match Creation
    console.log("1. Testing Match Scheduling...");
    const matchData = {
        item_type: 'match',
        match_type: 'friendly',
        ball_type: 'tennis',
        overs: 5,
        team1_name: 'Smoke Test XI',
        team2_name: 'Robot Challengers',
        team1_id: 'team_1',
        team2_id: 'team_2',
        match_date: '2026-01-22',
        status: 'scheduled'
    };

    // @ts-ignore
    const newMatch = mockDB.createMatch(matchData);

    if (newMatch && newMatch.id) {
        console.log(`   PASS: Match created with ID: ${newMatch.id}`);
    } else {
        throw new Error("Match creation failed");
    }

    // 2. Test Fetching Match
    console.log("2. Testing Match Retrieval...");
    const fetchedMatch = mockDB.getMatch(newMatch.id);
    if (fetchedMatch && fetchedMatch.team1_name === 'Smoke Test XI') {
        console.log("   PASS: Match retrieved successfully");
    } else {
        throw new Error("Match retrieval failed");
    }

    // 3. Test Scoring (Saving a Ball)
    console.log("3. Testing Scoring Persistence...");
    // @ts-ignore
    mockDB.saveBall(newMatch.id, {
        runs: 6,
        isWicket: false,
        batsmanId: 'bat1',
        bowlerId: 'bowl1',
        overNumber: 0
    });

    const balls = mockDB.getBalls(newMatch.id);
    if (balls.length === 1 && balls[0].runs === 6) {
        console.log("   PASS: Ball data saved and retrieved (6 Runs)");
    } else {
        throw new Error("Scoring persistence failed");
    }

    // 4. Test Match Completion Update
    console.log("4. Testing Match Completion...");
    // @ts-ignore
    mockDB.updateMatch(newMatch.id, { status: 'completed', result: 'Smoke Test XI Won' });
    const completedMatch = mockDB.getMatch(newMatch.id);

    if (completedMatch?.status === 'completed') {
        console.log("   PASS: Match status updated to completed");
    } else {
        throw new Error("Match update failed");
    }

    console.log("\n✅ SMOKE TEST PASSED: Core logic is functioning correctly.");

} catch (error) {
    console.error("\n❌ SMOKE TEST FAILED:", error);
    process.exit(1);
}
