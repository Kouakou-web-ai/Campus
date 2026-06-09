import { create } from 'zustand';

export interface UniversityBranding {
  name: string;
  primaryColor: string;
  logoUrl: string;
  themeName: string;
}

export interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
}

interface UniversityState {
  currentUniversityId: string | null;
  branding: UniversityBranding | null;
  academicYears: AcademicYear[];
  setUniversity: (universityId: string) => Promise<void>;
  loadAcademicYears: () => Promise<void>;
}

export const useUniversityStore = create<UniversityState>((set) => ({
  currentUniversityId: null,
  branding: null,
  academicYears: [],
  setUniversity: async (universityId) => {
    // Simuler chargement du branding d'une université
    set({ 
      currentUniversityId: universityId,
      branding: { 
        name: 'Campus Paris Sorbonne', 
        primaryColor: '#3b82f6', 
        logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=80&h=80&fit=crop&q=80', 
        themeName: 'corporate' 
      }
    });
  },
  loadAcademicYears: async () => {
    set({
      academicYears: [
        { id: '2025-2026', label: 'Année Académique 2025-2026', isActive: true },
        { id: '2024-2025', label: 'Année Académique 2024-2025', isActive: false }
      ]
    });
  }
}));
