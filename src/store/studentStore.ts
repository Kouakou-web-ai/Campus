import { create } from 'zustand';

export interface Course {
  id: string;
  code: string;
  title: string;
  teacherName: string;
  description: string;
  credits: number;
}

export interface Grade {
  id: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  coefficient: number;
  date: string;
  comments?: string;
}

export interface ELearningModule {
  id: string;
  title: string;
  progress: number; // 0-100
  lessonsCount: number;
  completedLessonsCount: number;
}

interface StudentState {
  courses: Course[];
  grades: Grade[];
  modules: ELearningModule[];
  loading: boolean;
  fetchStudentData: (universityId: string, studentId: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  courses: [],
  grades: [],
  modules: [],
  loading: false,
  fetchStudentData: async (_universityId, _studentId) => {
    set({ loading: true });
    // Simulation d'appel API filtré par universityId et studentId
    await new Promise((resolve) => setTimeout(resolve, 600));
    set({
      courses: [
        { id: 'c1', code: 'INF101', title: 'Algorithmique & Structures de Données', teacherName: 'Dr. Martin', description: 'Bases de la programmation et structures.', credits: 6 },
        { id: 'c2', code: 'MATH201', title: 'Algèbre Linéaire', teacherName: 'Mme. Dubois', description: 'Matrices et espaces vectoriels.', credits: 4 }
      ],
      grades: [
        { id: 'g1', courseTitle: 'Algorithmique & Structures de Données', score: 16, maxScore: 20, coefficient: 2, date: '2026-05-12', comments: 'Très bon travail' },
        { id: 'g2', courseTitle: 'Algèbre Linéaire', score: 14, maxScore: 20, coefficient: 1, date: '2026-05-20', comments: 'Régulier' }
      ],
      modules: [
        { id: 'm1', title: 'Introduction au JavaScript Moderne', progress: 80, lessonsCount: 10, completedLessonsCount: 8 },
        { id: 'm2', title: 'React Basics - Composants et Props', progress: 40, lessonsCount: 5, completedLessonsCount: 2 }
      ],
      loading: false
    });
  }
}));
