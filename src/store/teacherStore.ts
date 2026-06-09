import { create } from 'zustand';

export interface TeacherClass {
  id: string;
  name: string;
  studentCount: number;
  courseTitle: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  classId: string;
  submissionsCount: number;
}

interface TeacherState {
  classes: TeacherClass[];
  assignments: Assignment[];
  loading: boolean;
  fetchTeacherData: (universityId: string, teacherId: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'submissionsCount'>) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  classes: [],
  assignments: [],
  loading: false,
  fetchTeacherData: async (_universityId, _teacherId) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));
    set({
      classes: [
        { id: 'cl1', name: 'Master 1 Informatique - Groupe A', studentCount: 28, courseTitle: 'Génie Logiciel Avancé' },
        { id: 'cl2', name: 'Licence 3 Informatique - TD 2', studentCount: 35, courseTitle: 'Bases de Données Relationnelles' }
      ],
      assignments: [
        { id: 'a1', title: 'Projet Final : Architecture Propre en React', dueDate: '2026-06-25', classId: 'cl1', submissionsCount: 12 },
        { id: 'a2', title: 'TP 3 : Optimisation des Requêtes SQL', dueDate: '2026-06-15', classId: 'cl2', submissionsCount: 34 }
      ],
      loading: false
    });
  },
  addAssignment: (assignment) => set((state) => ({
    assignments: [
      ...state.assignments,
      {
        ...assignment,
        id: `a-${Date.now()}`,
        submissionsCount: 0
      }
    ]
  }))
}));
