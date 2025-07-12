import { NavItem } from 'types';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'medecin' | 'patient';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

// Navigation pour Admin
export const adminNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    url: '/admin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'b'],
    items: []
  },
  {
    title: 'Utilisateurs',
    url: '/admin/users',
    icon: 'users',
    isActive: false,
    shortcut: ['u', 's'],
    items: []
  },
  {
    title: 'Paramètres',
    url: '/admin/parametres',
    icon: 'settings',
    isActive: false,
    shortcut: ['p', 'a'],
    items: []
  }
];

// Navigation pour Médecin
export const medecinNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    url: '/medecin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'b'],
    items: []
  },
  {
    title: 'Mon profil',
    url: '/medecin/profile',
    icon: 'user',
    isActive: false,
    shortcut: ['m', 'p'],
    items: []
  },
  {
    title: 'Mes rendez-vous',
    url: '/medecin/rendez-vous',
    icon: 'calendar',
    isActive: false,
    shortcut: ['r', 'v'],
    items: []
  },
  {
    title: 'Calendrier',
    url: '/medecin/calendrier',
    icon: 'calendarDays',
    isActive: false,
    shortcut: ['c', 'a'],
    items: []
  },
  {
    title: 'Dossiers médicaux',
    url: '/medecin/dossiers',
    icon: 'fileText',
    isActive: false,
    shortcut: ['d', 'm'],
    items: []
  }
];

// Navigation pour Patient
export const patientNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    url: '/patient/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'b'],
    items: []
  },
  {
    title: 'Mon profil',
    url: '/patient/profile',
    icon: 'user',
    isActive: false,
    shortcut: ['m', 'p'],
    items: []
  },
  {
    title: 'Mon dossier médical',
    url: '/patient/dossier',
    icon: 'fileHeart',
    isActive: false,
    shortcut: ['d', 'o'],
    items: []
  },
  {
    title: 'Mon dossier médical',
    url: '/patient/dossier-medical',
    icon: 'fileText',
    isActive: false,
    shortcut: ['d', 'o'],
    items: []
  },
  {
    title: 'Mes médecins',
    url: '/patient/medecin',
    icon: 'userDoctor',
    isActive: false,
    shortcut: ['m', 'd'],
    items: []
  },
  {
    title: 'Mes consultations',
    url: '/patient/consultation/mes-consultation',
    icon: 'fileText',
    isActive: false,
    shortcut: ['m', 'c'],
    items: []
  },
];

// Fonction pour obtenir la navigation selon le rôle
export const getNavItemsByRole = (role: 'admin' | 'medecin' | 'patient'): NavItem[] => {
  switch (role) {
    case 'admin':
      return adminNavItems;
    case 'medecin':
      return medecinNavItems;
    case 'patient':
      return patientNavItems;
    default:
      return [];
  }
};

// Interface pour les statistiques du tableau de bord
export interface DashboardStats {
  admin: {
    totalUsers: number;
    totalMedecins: number;
    totalPatients: number;
    consultationsToday: number;
  };
  medecin: {
    patientsTotal: number;
    rendezVousToday: number;
    rendezVousWeek: number;
    consultationsMonth: number;
  };
  patient: {
    prochainRendezVous: string | null;
    consultationsTotal: number;
    ordonnancesActives: number;
    derniereConsultation: string | null;
  };
}

// Interface utilisateur médical
export interface MedicalUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'medecin' | 'patient';
  avatar_url?: string;
  phone?: string;
  address?: string;
  specialite?: string; // Pour les médecins
  numero_ordre?: string; // Pour les médecins
  date_naissance?: string; // Pour les patients
  numero_securite_sociale?: string; // Pour les patients
  created_at: string;
  updated_at: string;
}