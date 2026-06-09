import type {
  University, Student, Teacher, Course, Transaction,
  Grade, Assignment, Resource, ScheduleEvent, RevenueData,
} from '../types';

// ============================================
// DONNÉES MOCK — CAMPUS SaaS (CÔTE D'IVOIRE)
// ============================================

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenus: 27500000, objectif: 29500000, clients: 12 },
  { month: 'Fév', revenus: 30800000, objectif: 31500000, clients: 14 },
  { month: 'Mar', revenus: 34100000, objectif: 32800000, clients: 16 },
  { month: 'Avr', revenus: 32100000, objectif: 34100000, clients: 15 },
  { month: 'Mai', revenus: 40000000, objectif: 36000000, clients: 18 },
  { month: 'Jun', revenus: 44600000, objectif: 39300000, clients: 21 },
  { month: 'Jul', revenus: 47200000, objectif: 42600000, clients: 23 },
  { month: 'Aoû', revenus: 42600000, objectif: 44600000, clients: 22 },
  { month: 'Sep', revenus: 51100000, objectif: 47200000, clients: 26 },
  { month: 'Oct', revenus: 55700000, objectif: 52400000, clients: 29 },
  { month: 'Nov', revenus: 59700000, objectif: 55700000, clients: 31 },
  { month: 'Déc', revenus: 64200000, objectif: 59000000, clients: 34 },
];

export const mockUniversities: University[] = [
  {
    id: 'univ-ufhb',
    name: 'Université Félix Houphouët-Boigny',
    city: 'Abidjan (Cocody)',
    country: "Côte d'Ivoire",
    plan: 'enterprise',
    status: 'actif',
    studentsCount: 64200,
    teachersCount: 1850,
    mrr: 8125000,
    createdAt: '2023-09-01',
  },
  {
    id: 'univ-una',
    name: 'Université Nangui Abrogoua',
    city: 'Abidjan (Abobo)',
    country: "Côte d'Ivoire",
    plan: 'pro',
    status: 'actif',
    studentsCount: 32000,
    teachersCount: 920,
    mrr: 3800000,
    createdAt: '2024-01-15',
  },
  {
    id: 'univ-uao',
    name: 'Université Alassane Ouattara',
    city: 'Bouaké',
    country: "Côte d'Ivoire",
    plan: 'pro',
    status: 'actif',
    studentsCount: 28100,
    teachersCount: 840,
    mrr: 2750000,
    createdAt: '2024-03-01',
  },
  {
    id: 'univ-inphb',
    name: 'INP-HB (Yamoussoukro)',
    city: 'Yamoussoukro',
    country: "Côte d'Ivoire",
    plan: 'enterprise',
    status: 'actif',
    studentsCount: 4850,
    teachersCount: 310,
    mrr: 12450000,
    createdAt: '2023-09-01',
  },
  {
    id: 'univ-ujlg',
    name: 'Université Jean Lorougnon Guédé',
    city: 'Daloa',
    country: "Côte d'Ivoire",
    plan: 'starter',
    status: 'actif',
    studentsCount: 14500,
    teachersCount: 420,
    mrr: 1250000,
    createdAt: '2024-06-10',
  },
  {
    id: 'univ-upgc',
    name: 'Université Péléforo Gon Coulibaly',
    city: 'Korhogo',
    country: "Côte d'Ivoire",
    plan: 'starter',
    status: 'en_attente',
    studentsCount: 9800,
    teachersCount: 310,
    mrr: 650000,
    createdAt: '2024-10-01',
  },
];

export const mockStudents: Student[] = [
  {
    id: 's1', name: 'Koffi Yao Stéphane', email: 'stephane.koffi@univ-ufhb.ci',
    studentId: 'ETU-2024-0142', filiere: 'Informatique', annee: 3,
    status: 'actif', average: 15.4, absences: 2, paidAmount: 350000, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
  {
    id: 's2', name: 'Kouadio Amenan Sarah', email: 'sarah.kouadio@univ-ufhb.ci',
    studentId: 'ETU-2024-0098', filiere: 'Mathématiques', annee: 2,
    status: 'actif', average: 13.8, absences: 5, paidAmount: 210000, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
  {
    id: 's3', name: 'Yao Konan Ange', email: 'ange.yao@univ-ufhb.ci',
    studentId: 'ETU-2024-0213', filiere: 'Économie', annee: 1,
    status: 'actif', average: 17.2, absences: 0, paidAmount: 420000, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
  {
    id: 's4', name: 'Coulibaly Bakary', email: 'bakary.coulibaly@univ-ufhb.ci',
    studentId: 'ETU-2023-0387', filiere: 'Informatique', annee: 4,
    status: 'inactif', average: 10.1, absences: 18, paidAmount: 0, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
  {
    id: 's5', name: 'Touré Aminata', email: 'aminata.toure@univ-ufhb.ci',
    studentId: 'ETU-2024-0067', filiere: 'Droit', annee: 2,
    status: 'actif', average: 16.0, absences: 1, paidAmount: 420000, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
  {
    id: 's6', name: 'Bakayoko Ibrahim', email: 'ibrahim.bakayoko@univ-ufhb.ci',
    studentId: 'ETU-2024-0291', filiere: 'Physique', annee: 3,
    status: 'en_attente', average: 12.5, absences: 8, paidAmount: 140000, totalAmount: 420000,
    universityId: 'univ-ufhb',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 't1', name: 'Prof. Koffi Kouamé Alexandre', email: 'a.koffi@univ-ufhb.ci',
    specialite: 'Algorithmique', coursCount: 4, studentsCount: 186, rating: 4.8,
    hoursPerWeek: 18, status: 'actif', universityId: 'univ-ufhb',
  },
  {
    id: 't2', name: 'Dr. Diomandé Massandjé', email: 'm.diomande@univ-ufhb.ci',
    specialite: 'Analyse Numérique', coursCount: 3, studentsCount: 124, rating: 4.6,
    hoursPerWeek: 14, status: 'actif', universityId: 'univ-ufhb',
  },
  {
    id: 't3', name: 'Prof. Sylla Fatoumata', email: 'f.sylla@univ-ufhb.ci',
    specialite: 'Droit Civil', coursCount: 5, studentsCount: 242, rating: 4.9,
    hoursPerWeek: 22, status: 'actif', universityId: 'univ-ufhb',
  },
  {
    id: 't4', name: 'M. Koné Jean-Pierre', email: 'jp.kone@univ-ufhb.ci',
    specialite: 'Macroéconomie', coursCount: 2, studentsCount: 98, rating: 4.2,
    hoursPerWeek: 10, status: 'inactif', universityId: 'univ-ufhb',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'c1', title: 'Algorithmique Avancée', code: 'INFO-301',
    teacher: 'Prof. Koffi Kouamé Alexandre', teacherId: 't1', filiere: 'Informatique',
    semester: 1, credits: 6, studentsEnrolled: 48, studentsMax: 60,
    status: 'en_cours', schedule: 'Lun/Mer 10h-12h', progress: 65,
    universityId: 'univ-ufhb',
  },
  {
    id: 'c2', title: 'Bases de Données', code: 'INFO-201',
    teacher: 'Dr. Diomandé Massandjé', teacherId: 't2', filiere: 'Informatique',
    semester: 1, credits: 4, studentsEnrolled: 55, studentsMax: 60,
    status: 'en_cours', schedule: 'Mar/Jeu 14h-16h', progress: 80,
    universityId: 'univ-ufhb',
  },
  {
    id: 'c3', title: 'Droit des Contrats', code: 'DROIT-201',
    teacher: 'Prof. Sylla Fatoumata', teacherId: 't3', filiere: 'Droit',
    semester: 2, credits: 5, studentsEnrolled: 62, studentsMax: 70,
    status: 'planifie', schedule: 'Ven 09h-12h', progress: 0,
    universityId: 'univ-ufhb',
  },
  {
    id: 'c4', title: 'Calcul Intégral', code: 'MATH-101',
    teacher: 'Prof. Koffi Kouamé Alexandre', teacherId: 't1', filiere: 'Mathématiques',
    semester: 1, credits: 6, studentsEnrolled: 38, studentsMax: 45,
    status: 'termine', schedule: 'Lun/Jeu 08h-10h', progress: 100,
    universityId: 'univ-ufhb',
  },
];

export const mockTransactions: Transaction[] = [
  { id: 'tr1', studentName: 'Koffi Yao Stéphane', type: 'Frais de scolarité S1', amount: 175000, status: 'paye', date: '2024-09-15', method: 'Mobile Money' },
  { id: 'tr2', studentName: 'Yao Konan Ange', type: 'Frais de scolarité annuel', amount: 420000, status: 'paye', date: '2024-09-01', method: 'Mobile Money' },
  { id: 'tr3', studentName: 'Kouadio Amenan Sarah', type: 'Frais de scolarité S1', amount: 210000, status: 'paye', date: '2024-09-20', method: 'Virement' },
  { id: 'tr4', studentName: 'Coulibaly Bakary', type: 'Frais de scolarité S1', amount: 175000, status: 'en_retard', date: '2024-10-01', method: '—' },
  { id: 'tr5', studentName: 'Touré Aminata', type: 'Frais de scolarité annuel', amount: 420000, status: 'paye', date: '2024-09-05', method: 'Carte' },
  { id: 'tr6', studentName: 'Bakayoko Ibrahim', type: 'Acompte S1', amount: 70000, status: 'en_attente', date: '2024-10-10', method: 'Mobile Money' },
];

export const mockGrades: Grade[] = [
  { id: 'g1', studentId: 's1', studentName: 'Koffi Yao Stéphane', courseId: 'c1', note: 16, appreciation: 'Très bien', submitted: true },
  { id: 'g2', studentId: 's2', studentName: 'Kouadio Amenan Sarah', courseId: 'c1', note: 13, appreciation: 'Assez bien', submitted: true },
  { id: 'g3', studentId: 's3', studentName: 'Yao Konan Ange', courseId: 'c1', note: 18, appreciation: 'Excellent', submitted: true },
  { id: 'g4', studentId: 's4', studentName: 'Coulibaly Bakary', courseId: 'c1', note: 8, appreciation: 'Insuffisant', submitted: true },
  { id: 'g5', studentId: 's5', studentName: 'Touré Aminata', courseId: 'c1', note: 15, appreciation: 'Bien', submitted: true },
  { id: 'g6', studentId: 's6', studentName: 'Bakayoko Ibrahim', courseId: 'c1', submitted: false },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'a1', title: 'TP Noté — Tri rapide', courseId: 'c1', courseTitle: 'Algorithmique Avancée',
    dueDate: '2024-12-01', status: 'publie', submissionsCount: 42, studentsCount: 48,
    description: "Implémenter et analyser l'algorithme de tri rapide avec des variantes.", maxGrade: 20,
  },
  {
    id: 'a2', title: 'Projet BDD — Modélisation', courseId: 'c2', courseTitle: 'Bases de Données',
    dueDate: '2024-11-25', status: 'publie', submissionsCount: 55, studentsCount: 55,
    description: 'Concevoir et implémenter une base de données relationnelle complète.', maxGrade: 20,
  },
  {
    id: 'a3', title: 'Examen Mi-Semestre', courseId: 'c1', courseTitle: 'Algorithmique Avancée',
    dueDate: '2024-11-10', status: 'termine', submissionsCount: 48, studentsCount: 48,
    description: 'Examen portant sur les chapitres 1 à 5.', maxGrade: 20,
  },
  {
    id: 'a4', title: 'Dissertation — Contrats', courseId: 'c3', courseTitle: 'Droit des Contrats',
    dueDate: '2025-01-15', status: 'brouillon', submissionsCount: 0, studentsCount: 62,
    description: 'Analyse critique des clauses abusives dans les contrats de consommation.', maxGrade: 20,
  },
];

export const mockResources: Resource[] = [
  { id: 'r1', title: 'Cours Chapitre 3 — Graphes.pdf', type: 'pdf', courseId: 'c1', courseTitle: 'Algorithmique', size: '2.4 Mo', uploadedAt: '2024-10-15', downloadCount: 38 },
  { id: 'r2', title: 'Vidéo — Explication BFS/DFS', type: 'video', courseId: 'c1', courseTitle: 'Algorithmique', size: '145 Mo', uploadedAt: '2024-10-18', downloadCount: 44 },
  { id: 'r3', title: 'TP1 — Exercices Corrigés.pdf', type: 'pdf', courseId: 'c1', courseTitle: 'Algorithmique', size: '890 Ko', uploadedAt: '2024-10-22', downloadCount: 52 },
  { id: 'r4', title: 'Ressources SQL — Liens utiles', type: 'link', courseId: 'c2', courseTitle: 'Bases de Données', uploadedAt: '2024-10-12', downloadCount: 29 },
  { id: 'r5', title: 'Schéma UML de référence.png', type: 'image', courseId: 'c2', courseTitle: 'Bases de Données', size: '1.2 Mo', uploadedAt: '2024-10-20', downloadCount: 61 },
];

export const mockSchedule: ScheduleEvent[] = [
  { id: 'e1', title: 'Algorithmique Avancée', courseCode: 'INFO-301', room: 'Amphi A', teacher: 'M. Koffi', dayOfWeek: 0, startHour: 10, durationHours: 2, color: '#6366f1' },
  { id: 'e2', title: 'Bases de Données', courseCode: 'INFO-201', room: 'Salle 12', teacher: 'Dr. Diomandé', dayOfWeek: 1, startHour: 14, durationHours: 2, color: '#10b981' },
  { id: 'e3', title: 'Algorithmique Avancée', courseCode: 'INFO-301', room: 'Amphi A', teacher: 'M. Koffi', dayOfWeek: 2, startHour: 10, durationHours: 2, color: '#6366f1' },
  { id: 'e4', title: 'Bases de Données', courseCode: 'INFO-201', room: 'Salle 12', teacher: 'Dr. Diomandé', dayOfWeek: 3, startHour: 14, durationHours: 2, color: '#10b981' },
  { id: 'e5', title: 'Mathématiques', courseCode: 'MATH-201', room: 'Salle 8', teacher: 'Prof. Sylla', dayOfWeek: 0, startHour: 14, durationHours: 1.5, color: '#f59e0b' },
  { id: 'e6', title: 'Physique', courseCode: 'PHYS-101', room: 'Labo 3', teacher: 'Dr. Koné', dayOfWeek: 4, startHour: 9, durationHours: 3, color: '#ef4444' },
];

export const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const PLAN_COLORS: Record<string, string> = {
  starter: 'badge-ghost',
  pro: 'badge-primary',
  enterprise: 'badge-secondary',
};
