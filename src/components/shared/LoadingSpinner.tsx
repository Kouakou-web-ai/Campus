import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <span className="text-sm font-medium text-slate-500 animate-pulse">Chargement en cours...</span>
      </div>
    </div>
  );
}
