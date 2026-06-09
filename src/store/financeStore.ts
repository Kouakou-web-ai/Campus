import { create } from 'zustand';

export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  title: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
}

interface FinanceState {
  invoices: Invoice[];
  revenueData: RevenueData[];
  loading: boolean;
  fetchInvoices: (universityId: string) => Promise<void>;
  fetchRevenueData: () => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  invoices: [],
  revenueData: [],
  loading: false,
  fetchInvoices: async (_universityId) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      invoices: [
        { id: 'inv-1', amount: 1200, dueDate: '2026-09-01', status: 'PENDING', title: 'Frais de Scolarité - Semestre 1' },
        { id: 'inv-2', amount: 150, dueDate: '2026-06-15', status: 'PAID', title: 'Cotisation Bibliothèque Annuelle' },
        { id: 'inv-3', amount: 80, dueDate: '2026-05-10', status: 'OVERDUE', title: 'Frais d\'inscription Club Sportif' }
      ],
      loading: false
    });
  },
  fetchRevenueData: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      revenueData: [
        { month: 'Janvier', revenue: 45000, subscriptions: 15 },
        { month: 'Février', revenue: 48000, subscriptions: 16 },
        { month: 'Mars', revenue: 52000, subscriptions: 18 },
        { month: 'Avril', revenue: 58000, subscriptions: 20 },
        { month: 'Mai', revenue: 65000, subscriptions: 22 }
      ],
      loading: false
    });
  },
  payInvoice: async (invoiceId) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv
      ),
      loading: false
    }));
  }
}));
