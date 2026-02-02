import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'cric-nest-offline';
const VERSION = 1;

export interface OfflineBall {
    id: string;
    match_id: string;
    innings_no: number;
    over_number: number;
    ball_number: number;
    runs_scored: number;
    is_wicket: boolean;
    extras_type: string | null;
    extras_runs: number;
    batsman_name: string;
    bowler_name: string;
    player_out_name?: string;
    timestamp: string;
    sync_status: 'pending' | 'synced';
}

interface OfflineSchema {
    matches: {
        key: string;
        value: any;
    };
    balls: {
        key: string;
        value: OfflineBall;
        indexes: { 'by-match': string; 'by-status': string };
    };
}

let dbPromise: Promise<IDBPDatabase<OfflineSchema>>;

export const initDB = () => {
    dbPromise = openDB<OfflineSchema>(DB_NAME, VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('matches')) {
                db.createObjectStore('matches', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('balls')) {
                const ballStore = db.createObjectStore('balls', { keyPath: 'id' });
                ballStore.createIndex('by-match', 'match_id');
                ballStore.createIndex('by-status', 'sync_status');
            }
        },
    });
};

export const offlineStorage = {
    saveBall: async (ball: Omit<OfflineBall, 'sync_status' | 'timestamp'>) => {
        const db = await dbPromise;
        const fullBall: OfflineBall = {
            ...ball,
            timestamp: new Date().toISOString(),
            sync_status: 'pending',
        };
        await db.put('balls', fullBall);
        return fullBall;
    },

    getPendingBalls: async () => {
        const db = await dbPromise;
        return await db.getAllFromIndex('balls', 'by-status', 'pending');
    },

    markBallSynced: async (id: string) => {
        const db = await dbPromise;
        const ball = await db.get('balls', id);
        if (ball) {
            ball.sync_status = 'synced';
            await db.put('balls', ball);
        }
    },

    getMatchBalls: async (matchId: string) => {
        const db = await dbPromise;
        return await db.getAllFromIndex('balls', 'by-match', matchId);
    },

    saveMatch: async (match: any) => {
        const db = await dbPromise;
        await db.put('matches', match);
    },

    getMatch: async (id: string) => {
        const db = await dbPromise;
        return await db.get('matches', id);
    }
};
