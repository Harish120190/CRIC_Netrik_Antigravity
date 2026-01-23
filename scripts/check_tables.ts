
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env headers manually since we are in a script
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env')));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log("Checking connection to:", supabaseUrl);

    // Try to select from 'tournaments'
    const { data, error } = await supabase.from('tournaments').select('*').limit(1);

    if (error) {
        console.error("❌ Error accessing 'tournaments' table:", error.message);
        if (error.code === '42P01') { // Postgres code for undefined_table
            console.log("\n⚠️  CONCLUSION: The tables have NOT been created yet.");
            console.log("   Please run the SQL migration script I provided.");
        } else {
            console.log("\n⚠️  Connection Successful, but table access failed. It might not exist or RLS is blocking.");
        }
    } else {
        console.log("✅ SUCCESS: 'tournaments' table exists and is accessible.");
    }
}

checkTables();
