import React from 'react';
import { Calendar, Users, UserCheck, Plus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

export default function MedicalDashboard() {
  // Données pour le graphique en aires
  const chartData = [
    { month: 'Jan', appointments: 320, capacity: 450 },
    { month: 'Fév', appointments: 310, capacity: 420 },
    { month: 'Mar', appointments: 380, capacity: 480 },
    { month: 'Avr', appointments: 420, capacity: 520 },
    { month: 'Mai', appointments: 390, capacity: 500 },
    { month: 'Jun', appointments: 440, capacity: 550 },
    { month: 'Jul', appointments: 460, capacity: 580 },
    { month: 'Aoû', appointments: 430, capacity: 560 },
    { month: 'Sep', appointments: 410, capacity: 540 },
    { month: 'Oct', appointments: 450, capacity: 570 },
    { month: 'Nov', appointments: 470, capacity: 590 },
    { month: 'Déc', appointments: 440, capacity: 580 }
  ];

  return (
<PageContainer>
      <div className=" w-full inset-0 overflow-y-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord Admin</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Patients Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nombre de patients</p>
                <p className="text-3xl font-bold text-gray-900">40,689</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Appointments Today Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rendez-vous aujourd'hui</p>
                <p className="text-3xl font-bold text-gray-900">150</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Available Doctors Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Médecins disponibles</p>
                <p className="text-3xl font-bold text-gray-900">250</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Aperçu des Rendez-vous</h2>

          {/* Chart Container */}
          <div className="relative h-80">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 60" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="300" fill="url(#grid)" />

              {/* Y-axis labels */}
              <g className="text-xs fill-gray-400">
                <text x="20" y="250" textAnchor="middle">0</text>
                <text x="20" y="200" textAnchor="middle">200</text>
                <text x="20" y="150" textAnchor="middle">400</text>
                <text x="20" y="100" textAnchor="middle">600</text>
                <text x="20" y="50" textAnchor="middle">800</text>
              </g>

              {/* X-axis labels */}
              <g className="text-xs fill-gray-400">
                {chartData.map((item, index) => (
                  <text
                    key={item.month}
                    x={60 + (index * 60)}
                    y="280"
                    textAnchor="middle"
                  >
                    {item.month}
                  </text>
                ))}
              </g>

              {/* Area paths */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6b7280" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#6b7280" stopOpacity="0.1"/>
                </linearGradient>
              </defs>

              {/* Capacity area (background) */}
              <path
                d={`M 60 ${250 - (chartData[0].capacity * 250 / 600)} ${chartData.map((item, index) =>
                  `L ${60 + (index * 60)} ${250 - (item.capacity * 250 / 600)}`
                ).join(' ')} L 780 250 L 60 250 Z`}
                fill="url(#gradient2)"
              />

              {/* Appointments area */}
              <path
                d={`M 60 ${250 - (chartData[0].appointments * 250 / 600)} ${chartData.map((item, index) =>
                  `L ${60 + (index * 60)} ${250 - (item.appointments * 250 / 600)}`
                ).join(' ')} L 780 250 L 60 250 Z`}
                fill="url(#gradient1)"
              />

              {/* Capacity line */}
              <path
                d={`M 60 ${250 - (chartData[0].capacity * 250 / 600)} ${chartData.map((item, index) =>
                  `L ${60 + (index * 60)} ${250 - (item.capacity * 250 / 600)}`
                ).join(' ')}`}
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
              />

              {/* Appointments line */}
              <path
                d={`M 60 ${250 - (chartData[0].appointments * 250 / 600)} ${chartData.map((item, index) =>
                  `L ${60 + (index * 60)} ${250 - (item.appointments * 250 / 600)}`
                ).join(' ')}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-sm relative overflow-hidden">
          {/* Background medical image overlay */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
            <div className="w-full h-full bg-gradient-to-l from-gray-600 to-transparent flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center">
                <UserCheck className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Gérer les utilisateurs</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Ajoutez de nouveaux patients ou médecins à votre plateforme pour faciliter la gestion des rendez-vous et du suivi médical.
            </p>

            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Ajouter un nouvel utilisateur
            </button>
          </div>
        </div>
      </div>
</PageContainer>
  );
}