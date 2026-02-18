import api from "./api";
import { offlineStorage, OfflineBall } from "./offlineStorage";
import { toast } from "sonner";

class SyncManager {
    private isSyncing = false;

    async init() {
        window.addEventListener('online', () => this.sync());
        // Initial sync check
        if (navigator.onLine) {
            this.sync();
        }
    }

    async saveBall(ball: Omit<OfflineBall, 'sync_status' | 'timestamp'>) {
        // 1. Save to IndexedDB immediately
        const savedBall = await offlineStorage.saveBall(ball);

        // 2. Attempt to sync to "Server" (MockDB)
        if (navigator.onLine) {
            try {
                await this.pushBallToServer(savedBall);
                await offlineStorage.markBallSynced(savedBall.id);
            } catch (e) {
                console.warn("Manual sync failed, leaving as pending", e);
            }
        } else {
            toast.info("Connectivity lost. Scoring saved locally.");
        }

        return savedBall;
    }

    async sync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        const pending = await offlineStorage.getPendingBalls();
        if (pending.length > 0) {
            toast.promise(this.syncBatch(pending), {
                loading: `Syncing ${pending.length} deliveries...`,
                success: 'All deliveries synchronized!',
                error: 'Sync failed. Will retry later.'
            });
        }

        this.isSyncing = false;
    }

    private async syncBatch(balls: OfflineBall[]) {
        for (const ball of balls) {
            await this.pushBallToServer(ball);
            await offlineStorage.markBallSynced(ball.id);
        }
    }

    private async pushBallToServer(ball: OfflineBall) {
        // Mapping OfflineBall to API DTO format
        const payload = {
            match_id: ball.match_id,
            innings_no: ball.innings_no,
            over_number: ball.over_number,
            ball_number: ball.ball_number,
            runs_scored: ball.runs_scored,
            is_wicket: ball.is_wicket,
            extras_type: ball.extras_type,
            extras_runs: ball.extras_runs,
            batsman_name: ball.batsman_name,
            bowler_name: ball.bowler_name,
            player_out_name: ball.player_out_name
        };

        // Post to backend
        return api.post('/balls', payload);
    }
}

export const syncManager = new SyncManager();
