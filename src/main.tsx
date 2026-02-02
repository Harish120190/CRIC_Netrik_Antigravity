import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { initDB } from "./services/offlineStorage";
import { syncManager } from "./services/syncManager";
import "./services/proxyPreventionSeeder"; // Auto-seeds sample data

// Initialize Offline Support
initDB();
syncManager.init();

console.log(App);

import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
