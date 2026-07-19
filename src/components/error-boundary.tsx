"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-950/40 dark:bg-red-950/10">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-400">
            Something went wrong
          </h3>
          <p className="mt-1 text-xs text-red-700 dark:text-red-500">
            An unexpected error occurred in this section of the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
