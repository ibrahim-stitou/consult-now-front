'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Users, UserCheck, Plus, MoreVertical, Search, ChevronLeft, ChevronRight, Clock, Bell, Filter, X, Activity, Stethoscope } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

type AppointmentStatus = 'new' | 'decline' | 'in-progress' | 'done';

interface Appointment {
  id: number;
  name: string;
  status: AppointmentStatus;
  time: string;
  type: string;
  phone: string;
  notes?: string;
}

export default function MedicalDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, name: "Youssef El Mansouri", status: "new", time: "09:00", type: "Consultation générale", phone: "+212 6 12 34 56 78" },
    { id: 2, name: "Fatima Zahra Bennis", status: "decline", time: "09:30", type: "Contrôle", phone: "+212 6 23 45 67 89", notes: "Patient reporté" },
    { id: 3, name: "Mehdi Ait El Caid", status: "new", time: "10:00", type: "Première consultation", phone: "+212 6 34 56 78 90" },
    { id: 4, name: "Samira Oulhaj", status: "in-progress", time: "10:30", type: "Suivi", phone: "+212 6 45 67 89 01" },
    { id: 5, name: "Rachid Bouziane", status: "in-progress", time: "11:00", type: "Consultation urgente", phone: "+212 6 56 78 90 12" },
    { id: 6, name: "Leila Chraibi", status: "done", time: "11:30", type: "Contrôle", phone: "+212 6 67 89 01 23" },
    { id: 7, name: "Anas Idrissi", status: "done", time: "12:00", type: "Consultation générale", phone: "+212 6 78 90 12 34" },
    { id: 8, name: "Khadija Alami", status: "new", time: "14:00", type: "Première consultation", phone: "+212 6 89 01 23 45" },
  ]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const stats = useMemo(() => {
    const today = appointments.filter(apt => apt.status !== 'decline');
    const completed = appointments.filter(apt => apt.status === 'done');
    return {
      totalPatients: 1950 + appointments.length,
      todayAppointments: today.length,
      completedConsultations: completed.length
    };
  }, [appointments]);

  const getStatusText = (status: AppointmentStatus): string => {
    const statusMap = {
      'new': 'Nouveau',
      'decline': 'Refusé',
      'in-progress': 'En cours',
      'done': 'Terminé'
    };
    return statusMap[status];
  };

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      'new': {
        class: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
        dot: 'bg-blue-500',
        icon: <Clock className="w-4 h-4 mr-1" />
      },
      'decline': {
        class: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
        dot: 'bg-red-500',
        icon: <X className="w-4 h-4 mr-1" />
      },
      'in-progress': {
        class: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
        dot: 'bg-amber-500',
        icon: <Activity className="w-4 h-4 mr-1" />
      },
      'done': {
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
        dot: 'bg-emerald-500',
        icon: <UserCheck className="w-4 h-4 mr-1" />
      }
    };
    return configs[status];
  };

  const updateAppointmentStatus = (id: number, newStatus: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
    );
  };

  // Chart data for appointments
  const chartData = [
    { month: 'Jan', appointments: 320, capacity: 450 },
    { month: 'Fév', appointments: 280, capacity: 450 },
    { month: 'Mar', appointments: 350, capacity: 450 },
    { month: 'Avr', appointments: 390, capacity: 500 },
    { month: 'Mai', appointments: 400, capacity: 500 },
    { month: 'Juin', appointments: 380, capacity: 500 },
    { month: 'Juil', appointments: 360, capacity: 450 },
    { month: 'Août', appointments: 320, capacity: 450 },
    { month: 'Sept', appointments: 390, capacity: 500 },
    { month: 'Oct', appointments: 410, capacity: 500 },
    { month: 'Nov', appointments: 430, capacity: 500 },
    { month: 'Déc', appointments: 380, capacity: 500 },
  ];

  return (
    <PageContainer>
      <div className="w-full inset-0 overflow-y-auto mb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-8 h-8 text-green-500" />
                Tableau de bord médecin
              </h1>
              <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nombre de patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-500">+12% ce mois</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rendez-vous aujourd'hui</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-500">{appointments.filter(a => a.status === 'in-progress').length} en cours</span>
                  </div>
                </div>
                <div className="w-16 h-16  bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consultations terminées</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedConsultations}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-500">Taux: 87%</span>
                  </div>
                </div>
                <div className="w-16 h-16  bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Appointments Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                Rendez-vous du jour
              </h2>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="relative flex-1 w-full">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                  <Search className="h-full w-full" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Filter className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Filtrer par:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                  className="py-1.5 pl-2 pr-8 text-gray-700 bg-transparent border-l border-gray-200 focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="new">Nouveau</option>
                  <option value="in-progress">En cours</option>
                  <option value="done">Terminé</option>
                  <option value="decline">Refusé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="divide-y divide-gray-100">
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => {
                const statusConfig = getStatusConfig(appointment.status);
                return (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                            {appointment.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <h3 className="font-semibold text-gray-900">{appointment.name}</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusConfig.class}`}>
                            {statusConfig.icon}
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 ml-12">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{appointment.type}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{appointment.phone}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-amber-600 mt-2 ml-12 italic bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-100">
                            {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusConfig.class}`}
                          onClick={() => {
                            const statuses: AppointmentStatus[] = ['new', 'in-progress', 'done', 'decline'];
                            const currentIndex = statuses.indexOf(appointment.status);
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                            updateAppointmentStatus(appointment.id, nextStatus);
                          }}
                        >
                          Changer statut
                        </button>

                        <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucun rendez-vous trouvé</p>
                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAppointments.length)} sur {filteredAppointments.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-500 text-white shadow-md'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Évolution des consultations
          </h2>

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
                <text x="30" y="250" textAnchor="middle">0</text>
                <text x="30" y="200" textAnchor="middle">200</text>
                <text x="30" y="150" textAnchor="middle">400</text>
                <text x="30" y="100" textAnchor="middle">600</text>
                <text x="30" y="50" textAnchor="middle">800</text>
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

              {/* Data points */}
              {chartData.map((item, index) => (
                <circle
                  key={index}
                  cx={60 + (index * 60)}
                  cy={250 - (item.appointments * 250 / 600)}
                  r="4"
                  fill="#10b981"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Consultations</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 mr-2"></div>
              <span className="text-sm text-gray-600">Capacité</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}