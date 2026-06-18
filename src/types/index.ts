// ============================================
// TYPES GLOBAUX — CAMPUS SaaS
// ============================================

export type StatTrend = 'up' | 'down' | 'neutral';

export interface StatCardData {
  title: string;
  value: string | number;
  change: number;
  trend: StatTrend;
  unit?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  gradient?: string;
  description?: string;
}

export type StatusType =
  | 'actif'
  | 'inactif'
  | 'en_attente'
  | 'suspendu'
  | 'termine'
  | 'brouillon'
  | 'publie'
  | 'paye'
  | 'en_retard'
  | 'annule'
  | 'planifie'
  | 'en_cours';

export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: StatusType;
  studentsCount: number;
  teachersCount: number;
  mrr: number;
  createdAt: string;
  logo?: string;
  adminUid?: string;
  adminName?: string;
  adminEmail?: string;
  coursCount?: number;
  devoirsCount?: number;
  ressourcesCount?: number;
  transactionsCount?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  studentId: string;
  filiere: string;
  annee: number;
  status: StatusType;
  average: number;
  absences: number;
  paidAmount: number;
  totalAmount: number;
  universityId: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialite: string;
  coursCount: number;
  studentsCount: number;
  rating: number;
  hoursPerWeek: number;
  status: StatusType;
  universityId: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  teacher: string;
  teacherId: string;
  filiere: string;
  semester: number;
  credits: number;
  studentsEnrolled: number;
  studentsMax: number;
  status: StatusType;
  schedule: string;
  progress: number;
  universityId: string;
}

export interface Transaction {
  id: string;
  studentName: string;
  type: string;
  amount: number;
  status: StatusType;
  date: string;
  method: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  avatar?: string;
  courseId: string;
  note?: number;
  appreciation?: string;
  submitted: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate: string;
  status: StatusType;
  submissionsCount: number;
  studentsCount: number;
  description: string;
  maxGrade: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'archive' | 'image';
  courseId: string;
  courseTitle: string;
  size?: string;
  uploadedAt: string;
  downloadCount: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  courseCode: string;
  room: string;
  teacher?: string;
  dayOfWeek: number; // 0=Mon, 4=Fri
  startHour: number;
  durationHours: number;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface RevenueData {
  month: string;
  revenus: number;
  objectif: number;
  clients: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
}
