// Complete Dashboard and Patient Pages for PresX

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardService, patientService } from '@/lib/firestore';
import { DashboardData, Patient } from '@/types/firestore';
import { Loader2, AlertCircle } from 'lucide-react';

// Dashboard/Homepage Component
export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Make sure Firebase is configured correctly. Check the setup guide for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, Dr. Smith</h1>
        <p className="text-gray-600">Here's what's happening with your patients today.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Patients"
          value={dashboardData.stats.totalPatients}
          icon="👥"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          textColor="text-blue-700"
          trend="+12% from last month"
        />
        <StatsCard
          title="Recent Prescriptions"
          value={dashboardData.stats.recentPrescriptions}
          subtitle="Last 7 days"
          icon="📝"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          textColor="text-green-700"
          trend="+8% from last week"
        />
        <StatsCard
          title="Today's Prescriptions"
          value={dashboardData.stats.todaysPrescriptions}
          subtitle="Today"
          icon="⚡"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          textColor="text-purple-700"
          trend="+3 since yesterday"
        />
        <StatsCard
          title="Active Patients"
          value={dashboardData.stats.activePatients}
          subtitle="This month"
          icon="🩺"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          textColor="text-orange-700"
          trend="+18% from last month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions Generated</h2>
              <Link 
                href="/patients"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Patients
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentPatients.map((patient, index) => (
                <PatientCard key={patient.id + index} patient={{
                  id: patient.id,
                  name: patient.personalInfo.name,
                  age: patient.personalInfo.age,
                  gender: patient.personalInfo.gender,
                  phone: patient.personalInfo.phone,
                  lastVisit: patient.latestPrescription?.consultationDate.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                  status: patient.latestPrescription?.status || 'active',
                  pdfUrl: patient.latestPrescription?.pdfUrl || '#',
                  consultationType: 'In-person' // Default, could be enhanced with more data
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={{
                  id: activity.id,
                  type: activity.type,
                  patientName: activity.patientName,
                  description: activity.description || `${activity.type.replace('_', ' ')} for ${activity.patientName}`,
                  timestamp: activity.timestamp?.toDate ? 
                    activity.timestamp.toDate().toLocaleString() : 
                    'Just now',
                  icon: activity.type === 'prescription_created' ? '📝' : '👤'
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/create">
              <QuickActionButton
                icon="�"
                title="Create Prescription"
                description="Write a new prescription for existing patient"
                action={() => {}}
              />
            </Link>
            <Link href="/patients">
              <QuickActionButton
                icon="�"
                title="View All Patients"
                description="Browse and manage all patient records"
                action={() => {}}
              />
            </Link>
            <Link href="/prescriptions">
              <QuickActionButton
                icon="📊"
                title="View Prescriptions"
                description="Access all prescriptions and reports"
                action={() => {}}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  bgColor: string;
  textColor: string;
  trend?: string;
}

function StatsCard({ title, value, subtitle, icon, bgColor, textColor, trend }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-gray-600">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`${textColor} text-sm font-medium mb-1`}>{title}</p>
        <p className={`${textColor} text-3xl font-bold`}>{value.toLocaleString()}</p>
        {subtitle && (
          <p className={`${textColor} text-xs opacity-70 mt-1`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Patient Card Component
interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    lastVisit: string;
    status: string;
    pdfUrl: string;
    consultationType: string;
  };
}

function PatientCard({ patient }: PatientCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span>📞</span> {patient.phone}
            </p>
            <p className="flex items-center gap-2">
              <span>📅</span> {new Date(patient.lastVisit).toLocaleDateString()}
            </p>
            <p className="flex items-center gap-2">
              <span>🏥</span> {patient.consultationType}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            patient.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {patient.status}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(patient.pdfUrl, '_blank')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View Prescription PDF"
            >
              📄
            </button>
            <button
              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="View Patient Details"
            >
              👁️
            </button>
            {/* Add audio playback button if recording exists */}
            <button
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="Play Conversation Recording"
            >
              🎵
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Card Component
interface ActivityCardProps {
  activity: {
    id: string;
    type: string;
    patientName: string;
    description: string;
    timestamp: string;
    icon: string;
  };
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="text-xl">{activity.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.patientName}</p>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
      </div>
    </div>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

function QuickActionButton({ icon, title, description, action }: QuickActionButtonProps) {
  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group cursor-pointer block"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// Patients Page Component
export function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const { patients: fetchedPatients } = await patientService.getAllPatients();
        setPatients(fetchedPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Convert Patient type to the format expected by the UI
  const convertPatientData = (patient: Patient) => ({
    id: patient.id,
    name: patient.personalInfo.name,
    age: patient.personalInfo.age,
    gender: patient.personalInfo.gender === 'male' ? 'Male' : patient.personalInfo.gender === 'female' ? 'Female' : 'Other',
    phone: patient.personalInfo.phone,
    email: patient.personalInfo.email || '',
    lastVisit: patient.updatedAt.toDate().toISOString().split('T')[0],
    consultationType: 'In-person', // Default value, could be enhanced
    diagnosis: 'N/A', // Could be fetched from latest prescription
    status: patient.isActive ? 'active' : 'inactive',
    pdfUrl: '#',
    testReports: [], // Could be enhanced with actual test reports
    createdAt: patient.createdAt.toDate().toISOString().split('T')[0]
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading patients...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Patients</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Make sure Firebase is configured correctly. Check the setup guide for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert patients for filtering
  const convertedPatients = patients.map(convertPatientData);

  // Filter and sort patients
  const filteredPatients = convertedPatients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.phone.includes(searchTerm) ||
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      const matchesGender = genderFilter === 'all' || patient.gender.toLowerCase() === genderFilter;
      return matchesSearch && matchesStatus && matchesGender;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'age': return a.age - b.age;
        case 'lastVisit': return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        default: return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading patients...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all patient records and prescriptions
          </p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        onClick={() => window.location.href = '/create'}>
          <span>👤</span>
          Add New Patient
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Patients
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'name', label: 'Name' },
              { value: 'age', label: 'Age' },
              { value: 'lastVisit', label: 'Last Visit' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {filteredPatients.length} patients found
          </span>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPatients.map((patient) => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + patientsPerPage, filteredPatients.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredPatients.length}</span>
                  {' '}results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Patient Row Component
interface PatientRowProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    lastVisit: string;
    consultationType: string;
    diagnosis: string;
    status: string;
    pdfUrl: string;
    testReports: string[];
    createdAt: string;
  };
}

function PatientRow({ patient }: PatientRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-sm text-gray-500">{patient.age} years • {patient.gender}</div>
            <div className="text-xs text-gray-400">Member since {new Date(patient.createdAt).getFullYear()}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{patient.phone}</div>
        <div className="text-sm text-gray-500">{patient.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(patient.lastVisit).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-500">{patient.consultationType}</div>
        <div className="text-xs text-gray-400">{patient.diagnosis}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          patient.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status}
        </span>
        {patient.testReports.length > 0 && (
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
              {patient.testReports.length} test{patient.testReports.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Patient Details"
          >
            👁️
          </button>
          <button
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Create New Prescription"
          >
            📝
          </button>
          <button
            onClick={() => window.open(patient.pdfUrl, '_blank')}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            title="View Latest Prescription"
          >
            📄
          </button>
          {patient.testReports.length > 0 && (
            <button
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              title="View Test Reports"
            >
              🧪
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
