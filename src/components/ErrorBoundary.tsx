import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const message = this.state.error.message;
          
          // Handle direct Firestore unavailable error
          if (message.includes('code=unavailable')) {
            errorMessage = "Could not reach the database. Please check your internet connection.";
            isFirestoreError = true;
          } else {
            const parsed = JSON.parse(message);
            if (parsed.error && parsed.operationType) {
              isFirestoreError = true;
              if (parsed.error.includes('code=unavailable')) {
                errorMessage = "Database connection failed. Please check your internet connection.";
              } else {
                errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
              }
            }
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center transition-colors duration-300">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-xl shadow-red-100 dark:shadow-red-900/10">
            <AlertTriangle className="h-12 w-12" />
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Something went wrong</h1>
          <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {isFirestoreError ? "We encountered a database permission issue. Our team has been notified." : "We've encountered an unexpected error. Please try refreshing the page."}
          </p>
          
          <div className="mt-8 p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left max-w-2xl overflow-auto">
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
              {errorMessage}
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button onClick={this.handleReset} className="h-14 px-8 rounded-2xl text-lg shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
              <RefreshCw className="mr-2 h-5 w-5" />
              Reload Application
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="h-14 px-8 rounded-2xl text-lg">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
