import { Component, type ReactNode } from 'react';
import AppRoutes from './routes/AppRoutes';
import ThemeProvider from './components/shared/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Filet de sécurité global — aucune page blanche silencieuse
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

import { useEffect } from 'react';
import { useRealtimeDataStore } from './store/realtimeDataStore';
import AppSplash from './components/shared/AppSplash';

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const serverData = (window as any).__PRELOADED_DATA__;
      if (serverData) {
        useRealtimeDataStore.setState({
          systemAnnouncement: serverData.announcement || null,
          currentUniversity: serverData.branding ? {
            id: 'univ-ufhb',
            name: serverData.branding.name || 'Université Atlantique d\'Abidjan',
            city: serverData.branding.city || 'Abidjan',
            country: serverData.branding.country || "Côte d'Ivoire",
            plan: 'pro',
            status: 'actif',
            studentsCount: 0,
            teachersCount: 0,
            mrr: 100000,
            createdAt: new Date().toISOString().split('T')[0],
            enforceLimits: false
          } : null
        });
      }
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AppSplash />
        <AppRoutes />
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

export default App;
