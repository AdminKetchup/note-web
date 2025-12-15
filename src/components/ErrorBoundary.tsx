'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        // TODO: Send to error tracking service (e.g., Sentry)
        // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#191919] p-4">
                    <div className="max-w-md w-full">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Minimal icon */}
                            <div className="text-6xl opacity-20">😵</div>

                            {/* Error message */}
                            <div className="space-y-2">
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Something went wrong
                                </h1>

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    An unexpected error occurred
                                </p>
                            </div>

                            {/* Development error details */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-lg text-left border border-gray-200 dark:border-gray-800">
                                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            {/* Reload button - Notion style */}
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 px-4 py-2 bg-[#2383E2] hover:bg-[#1a6ec7] text-white text-sm font-medium rounded transition-colors"
                            >
                                Reload page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
