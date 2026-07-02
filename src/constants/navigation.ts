import type { UserRole } from '../store/authStore';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  ClipboardList,
  FileText,
  Library,
  Award,
  CreditCard,
  Calendar,
  Eye,
  BarChart3,
  UserCheck,
  Home,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationByRole: Record<UserRole, NavSection[]> = {
  SUPER_ADMIN: [
    {
      items: [
        { label: 'Vue globale', path: '/app/super-admin', icon: LayoutDashboard },
        { label: 'Analytiques revenus', path: '/app/super-admin/revenus', icon: TrendingUp },
        { label: 'Universités', path: '/app/super-admin/universites', icon: Building2 },
        { label: 'Demandes administrateurs', path: '/app/super-admin/demandes', icon: UserCheck },
      ],
    },
  ],
  UNIVERSITY_ADMIN: [
    {
      title: 'Gestion',
      items: [
        { label: 'Tableau de bord', path: '/app/admin', icon: LayoutDashboard },
        { label: 'Gestionnaires', path: '/app/admin/gestionnaires', icon: ShieldCheck },
        { label: 'Classes', path: '/app/admin/classes', icon: Library },
        { label: 'Étudiants', path: '/app/admin/etudiants', icon: Users },
        { label: 'Enseignants', path: '/app/admin/enseignants', icon: GraduationCap },
        { label: 'Cours', path: '/app/admin/cours', icon: BookOpen },
        { label: 'Bulletins', path: '/app/admin/bulletins', icon: Award },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Centre financier', path: '/app/admin/finance', icon: DollarSign },
      ],
    },
  ],
  TEACHER: [
    {
      items: [
        { label: 'Tableau de bord', path: '/app/enseignant', icon: LayoutDashboard },
        { label: 'Gestion des notes', path: '/app/enseignant/notes', icon: ClipboardList },
        { label: 'Feuille d\'appel', path: '/app/enseignant/absences', icon: UserCheck },
        { label: 'Devoirs', path: '/app/enseignant/devoirs', icon: FileText },
        { label: 'Bulletins', path: '/app/admin/bulletins', icon: Award },
      ],
    },
  ],
  STUDENT: [
    {
      items: [
        { label: 'Portail', path: '/app/etudiant', icon: Home },
        { label: 'Résultats', path: '/app/etudiant/notes', icon: Award },
        { label: 'Paiements', path: '/app/etudiant/paiements', icon: CreditCard },
        { label: 'Emploi du temps', path: '/app/etudiant/planning', icon: Calendar },
      ],
    },
  ],
  PARENT: [
    {
      items: [
        { label: 'Suivi enfant', path: '/app/parent', icon: Eye },
        { label: 'Académique', path: '/app/parent/academique', icon: BarChart3 },
        { label: 'Scolarité', path: '/app/parent/scolarite', icon: CreditCard },
        { label: 'Évaluation & Suggestions', path: '/app/evaluation-suggestions', icon: MessageSquare },
      ],
    },
  ],
  FINANCE_MANAGER: [
    {
      title: 'Finance',
      items: [
        { label: 'Centre financier', path: '/app/admin/finance', icon: DollarSign },
      ],
    },
  ],
  STUDENT_MANAGER: [
    {
      title: 'Gestion',
      items: [
        { label: 'Étudiants', path: '/app/admin/etudiants', icon: Users },
      ],
    },
  ],
  TEACHER_MANAGER: [
    {
      title: 'Gestion',
      items: [
        { label: 'Enseignants', path: '/app/admin/enseignants', icon: GraduationCap },
      ],
    },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  UNIVERSITY_ADMIN: 'Admin Université',
  TEACHER: 'Enseignant',
  STUDENT: 'Étudiant',
  PARENT: 'Parent',
  FINANCE_MANAGER: 'Gestionnaire Finance',
  STUDENT_MANAGER: 'Gestionnaire Étudiants',
  TEACHER_MANAGER: 'Gestionnaire Enseignants',
};

export const roleDashboardPath: Record<UserRole, string> = {
  SUPER_ADMIN: '/app/super-admin',
  UNIVERSITY_ADMIN: '/app/admin',
  TEACHER: '/app/enseignant',
  STUDENT: '/app/etudiant',
  PARENT: '/app/parent',
  FINANCE_MANAGER: '/app/admin/finance',
  STUDENT_MANAGER: '/app/admin/etudiants',
  TEACHER_MANAGER: '/app/admin/enseignants',
};


