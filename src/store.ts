import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Role = 'Admin' | 'Bendahara' | 'User';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Member {
  id: string;
  nrp: string;
  nama: string;
}

export interface Payment {
  id: string;
  memberId: string;
  month: string;
  amount: number;
  paidAt: string; // ISO date string
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export const MONTHS = [
  'Jul-26', 'Agu-26', 'Sep-26', 'Okt-26', 'Nov-26', 'Des-26',
  'Jan-27', 'Feb-27', 'Mar-27', 'Apr-27', 'Mei-27', 'Jun-27'
];

interface AppState {
  currentUser: User | null;
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  monthlyFee: number;
  login: (role: Role, name: string) => void;
  logout: () => void;
  addMember: (m: Omit<Member, 'id'>) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addPayment: (p: Omit<Payment, 'id' | 'paidAt'>) => void;
  deletePayment: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

const DUMMY_MEMBERS: Member[] = [
  { id: '1', nrp: '10184', nama: 'NANANG SURYANA' },
  { id: '2', nrp: '10185', nama: 'BUDI SANTOSO' },
  { id: '3', nrp: '10186', nama: 'SITI AMINAH' },
  { id: '4', nrp: '10187', nama: 'ANDI PRASETYO' },
  { id: '5', nrp: '10188', nama: 'RINA MELATI' },
];

const DUMMY_PAYMENTS: Payment[] = [
  { id: 'p1', memberId: '1', month: 'Jul-26', amount: 100000, paidAt: '2026-07-05T10:00:00Z' },
  { id: 'p2', memberId: '1', month: 'Agu-26', amount: 100000, paidAt: '2026-08-05T10:00:00Z' },
  { id: 'p3', memberId: '2', month: 'Jul-26', amount: 100000, paidAt: '2026-07-10T10:00:00Z' },
  { id: 'p4', memberId: '3', month: 'Jul-26', amount: 100000, paidAt: '2026-07-15T10:00:00Z' },
  { id: 'p5', memberId: '3', month: 'Agu-26', amount: 100000, paidAt: '2026-08-15T10:00:00Z' },
  { id: 'p6', memberId: '3', month: 'Sep-26', amount: 100000, paidAt: '2026-09-15T10:00:00Z' },
];

const DUMMY_EXPENSES: Expense[] = [
  { id: 'e1', date: '2026-07-20T00:00:00Z', description: 'Pembelian Buku Kas', amount: 50000 },
  { id: 'e2', date: '2026-08-15T00:00:00Z', description: 'Fotokopi Dokumen', amount: 15000 },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      members: DUMMY_MEMBERS,
      payments: DUMMY_PAYMENTS,
      expenses: DUMMY_EXPENSES,
      monthlyFee: 100000, // 100k per month

      login: (role, name) => set({ currentUser: { id: uuidv4(), role, name } }),
      logout: () => set({ currentUser: null }),

      addMember: (m) => set((state) => ({ members: [...state.members, { ...m, id: uuidv4() }] })),
      updateMember: (id, m) => set((state) => ({
        members: state.members.map((member) => member.id === id ? { ...member, ...m } : member)
      })),
      deleteMember: (id) => set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        payments: state.payments.filter((p) => p.memberId !== id)
      })),

      addPayment: (p) => set((state) => {
        // Prevent duplicate payments for same member & month
        const exists = state.payments.find(ep => ep.memberId === p.memberId && ep.month === p.month);
        if (exists) return state;
        return {
          payments: [...state.payments, { ...p, id: uuidv4(), paidAt: new Date().toISOString() }]
        };
      }),
      deletePayment: (id) => set((state) => ({
        payments: state.payments.filter((p) => p.id !== id)
      })),

      addExpense: (e) => set((state) => ({ expenses: [...state.expenses, { ...e, id: uuidv4() }] })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),
    }),
    {
      name: 'tabungan-storage',
    }
  )
);
