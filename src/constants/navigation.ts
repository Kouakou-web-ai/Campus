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
        { label: 'Demandes d\'inscription', path: '/app/admin/demandes', icon: ClipboardList },
        { label: 'Étudiants', path: '/app/admin/etudiants', icon: Users },
        { label: 'Enseignants', path: '/app/admin/enseignants', icon: GraduationCap },
        { label: 'Cours', path: '/app/admin/cours', icon: BookOpen },
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
        { label: 'Messagerie', path: '/app/messagerie', icon: MessageSquare },
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
        { label: 'Messagerie', path: '/app/messagerie', icon: MessageSquare },
      ],
    },
  ],
  PARENT: [
    {
      items: [
        { label: 'Suivi enfant', path: '/app/parent', icon: Eye },
        { label: 'Académique', path: '/app/parent/academique', icon: BarChart3 },
        { label: 'Scolarité', path: '/app/parent/suivi', icon: CreditCard },
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
};

export const roleDashboardPath: Record<UserRole, string> = {
  SUPER_ADMIN: '/app/super-admin',
  UNIVERSITY_ADMIN: '/app/admin',
  TEACHER: '/app/enseignant',
  STUDENT: '/app/etudiant',
  PARENT: '/app/parent',
};

