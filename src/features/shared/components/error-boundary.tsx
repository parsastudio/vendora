"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

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
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-500/[0.02] p-8 text-center dark:border-rose-950/40 dark:bg-rose-950/[0.04]">
          <h3 className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
            Component Failure
          </h3>
          <p className="mt-2 text-xs text-rose-500/80 font-medium max-w-sm leading-relaxed">
            An unexpected error occurred in this segment of the platform. The workspace remains
            active.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
          >
            Restart Context
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
