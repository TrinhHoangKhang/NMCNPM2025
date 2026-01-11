
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>
                        {this.state.error && (
                            <div className="bg-slate-100 p-3 rounded text-left mb-6 overflow-auto max-h-32">
                                <code className="text-xs text-slate-700 font-mono">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Reload Page
                            </Button>
                            <Button onClick={() => window.location.href = '/'} className="bg-indigo-600 hover:bg-indigo-700">
                                <Home className="w-4 h-4 mr-2" /> Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
