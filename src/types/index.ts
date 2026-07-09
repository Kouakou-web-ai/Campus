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
  plan: 'gratuit' | 'starter' | 'pro' | 'premium' | 'enterprise';
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
  enforceLimits?: boolean;
}

export interface Class {
  id: string;
  name: string;
  filiere: string;
  annee: number;
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
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: 'M' | 'F';
  classeId?: string;
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
  classeId?: string;
  classeName?: string;
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
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  duration?: number; // in minutes
  progress: number;
  universityId: string;
  classeId?: string;
  classeName?: string;
  schedule?: string;
  room?: string;
}

export interface Attendance {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'retard';
  markedAt: string;
}

export interface CourseDocument {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
  size?: number;
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
  classNote?: number;
  examNote?: number;
  manualNote?: number;
  isManual?: boolean;
  appreciation?: string;
  submitted: boolean;
  classNotes?: number[];
  examNotes?: number[];
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
  url?: string;
  teacherId?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  courseCode: string;
  room: string;
  teacher?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  durationHours: number;
  color: string;
  dayOfWeek?: number;
  startHour?: number;
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

export interface DelegationInfo {
  active: boolean;
  expiresAt: string;
  originalRole: 'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER';
  delegatedBy: string;
}

export interface Gestionnaire {
  id: string;
  name: string;
  email: string;
  role: 'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER';
  status: 'actif' | 'suspendu';
  universityId: string;
  createdAt: string;
  delegation?: DelegationInfo;
}


