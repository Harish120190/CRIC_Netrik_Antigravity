import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

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
