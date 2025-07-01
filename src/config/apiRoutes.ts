const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

export const apiRoutes = {
  auth: {
    login: `${API_BASE}/login`,
    register: `${API_BASE}/register`,
    logout: `${API_BASE}/logout`,
    refreshToken: `${API_BASE}/refresh`,
    me: `${API_BASE}/me`,
    forgotPassword: `${API_BASE}/forgot-password`,
    resetPassword: `${API_BASE}/reset-password`
  },

  files: {
    uploadTemp: `${API_BASE}/files/upload-temp`,
    cleanupTemp: `${API_BASE}/files/cleanup-temp`
  },

  admin: {
    users: {
      getAll: `${API_BASE}/admin/users`,
      create: `${API_BASE}/admin/users`,
      getById: (id: string) => `${API_BASE}/admin/users/${id}`,
      update: (id: string) => `${API_BASE}/admin/users/${id}`,
      delete: (id: string) => `${API_BASE}/admin/users/${id}`,
      createGuest: `${API_BASE}/users/guest`,
      validateDoctor: (id: string) => `${API_BASE}/admin/users/${id}/validate-doctor`,
      rejectDoctor: (id: string) => `${API_BASE}/admin/users/${id}/reject-doctor`
    }
  },
  patient: {
    completeProfile: {
      get: `${API_BASE}/patient/profile/getData`,
      create: `${API_BASE}/patient/profile`,
      update: `${API_BASE}/patient/profile/update`,
      getDoctors: `${API_BASE}/patient/doctors`,
    },
    consultations:{
      doctorBusyHours: (doctorId: string) => `${API_BASE}/patient/doctor/${doctorId}/busy-hours`,
      addDemandeConsultation: `${API_BASE}/patient/demande-consultation`,
    }

  },
  medecin: {
    profile: {
      get: `${API_BASE}/medecin/profile`,
      create: `${API_BASE}/medecin/profile`,
      update: `${API_BASE}/medecin/profile`
    }
  },
  guest: {
    addGuest: `${API_BASE}/users/guest`
  },
  common: {
    profile: {
      get: `${API_BASE}/user`,
      update: `${API_BASE}/profile`,
      changePassword: `${API_BASE}/password`
    }

  }
};

export type ApiRoutes = typeof apiRoutes;