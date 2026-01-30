import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-glow border border-border">
                        <h2 className="text-2xl font-black text-destructive mb-4">Application Error</h2>
                        <p className="text-muted-foreground mb-6 font-medium">
                            The application crashed during rendering. This is often caused by a missing dependency or a null reference.
                        </p>
                        <div className="bg-muted/50 rounded-2xl p-4 mb-6 overflow-auto max-h-40 font-mono text-xs">
                            <p className="font-bold text-foreground mb-2">{this.state.error?.toString()}</p>
                            <pre className="text-muted-foreground">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl hover:opacity-90 transition-all"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
