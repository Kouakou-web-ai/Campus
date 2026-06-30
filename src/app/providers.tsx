'use client';

import React, { Component, type ReactNode } from 'react';
import ThemeProvider from '../components/shared/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Une erreur inattendue s'est produite
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-mono bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              {this.state.message}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, message: '' }); window.location.reload(); }}
              className="btn btn-primary"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
