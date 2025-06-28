// Complete Dashboard and Patient Pages for PresX

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock data for demonstration (replace with Firebase calls when ready)
const mockDashboardData = {
  stats: {
    totalPatients: 1247,
    recentPrescriptions: 89,
    todaysPrescriptions: 23,
    activePatients: 456
  },
  recentPatients: [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 34,
      gender: 'Female',
      phone: '+1 (555) 123-4567',
      lastVisit: '2025-06-27',
      status: 'active',
      pdfUrl: '#',
      consultationType: 'In-person'
    },
    {
      id: '2',
      name: 'Michael Chen',
      age: 45,
      gender: 'Male',
      phone: '+1 (555) 987-6543',
      lastVisit: '2025-06-26',
      status: 'fulfilled',
      pdfUrl: '#',
      consultationType: 'Teleconsultation'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      age: 28,
      gender: 'Female',
      phone: '+1 (555) 456-7890',
      lastVisit: '2025-06-25',
      status: 'active',
      pdfUrl: '#',
      consultationType: 'Follow-up'
    },
    {
      id: '4',
      name: 'David Wilson',
      age: 52,
      gender: 'Male',
      phone: '+1 (555) 321-0987',
      lastVisit: '2025-06-24',
      status: 'active',
      pdfUrl: '#',
      consultationType: 'In-person'
    }
  ],
  recentActivities: [
    {
      id: '1',
      type: 'prescription_created',
      patientName: 'Sarah Johnson',
      description: 'New prescription created for hypertension management',
      timestamp: '2 hours ago',
      icon: '📝'
    },
    {
      id: '2',
      type: 'patient_added',
      patientName: 'Michael Chen',
      description: 'New patient registration completed',
      timestamp: '4 hours ago',
      icon: '👤'
    },
    {
      id: '3',
      type: 'test_uploaded',
      patientName: 'Emily Rodriguez',
      description: 'Blood test results uploaded',
      timestamp: '6 hours ago',
      icon: '🧪'
    },
    {
      id: '4',
      type: 'prescription_created',
      patientName: 'David Wilson',
      description: 'Follow-up prescription for diabetes',
      timestamp: '1 day ago',
      icon: '📝'
    },
    {
      id: '5',
      type: 'patient_added',
      patientName: 'Lisa Anderson',
      description: 'New patient added to system',
      timestamp: '1 day ago',
      icon: '👤'
    }
  ]
};

const mockPatientsData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@email.com',
    lastVisit: '2025-06-27',
    consultationType: 'In-person',
    diagnosis: 'Hypertension',
    status: 'active',
    pdfUrl: '#',
    testReports: ['Blood Test', 'ECG'],
    createdAt: '2024-03-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 987-6543',
    email: 'michael.chen@email.com',
    lastVisit: '2025-06-26',
    consultationType: 'Teleconsultation',
    diagnosis: 'Type 2 Diabetes',
    status: 'fulfilled',
    pdfUrl: '#',
    testReports: ['HbA1c Test'],
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 456-7890',
    email: 'emily.rodriguez@email.com',
    lastVisit: '2025-06-25',
    consultationType: 'Follow-up',
    diagnosis: 'Migraine',
    status: 'active',
    pdfUrl: '#',
    testReports: ['MRI Scan'],
    createdAt: '2024-05-10'
  },
  {
    id: '4',
    name: 'David Wilson',
    age: 52,
    gender: 'Male',
    phone: '+1 (555) 321-0987',
    email: 'david.wilson@email.com',
    lastVisit: '2025-06-24',
    consultationType: 'In-person',
    diagnosis: 'Arthritis',
    status: 'active',
    pdfUrl: '#',
    testReports: ['X-Ray', 'Blood Test'],
    createdAt: '2023-11-08'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    age: 41,
    gender: 'Female',
    phone: '+1 (555) 654-3210',
    email: 'lisa.anderson@email.com',
    lastVisit: '2025-06-23',
    consultationType: 'In-person',
    diagnosis: 'Anxiety',
    status: 'fulfilled',
    pdfUrl: '#',
    testReports: [],
    createdAt: '2024-08-22'
  },
  {
    id: '6',
    name: 'Robert Kumar',
    age: 38,
    gender: 'Male',
    phone: '+1 (555) 789-0123',
    email: 'robert.kumar@email.com',
    lastVisit: '2025-06-22',
    consultationType: 'Teleconsultation',
    diagnosis: 'Common Cold',
    status: 'fulfilled',
    pdfUrl: '#',
    testReports: [],
    createdAt: '2024-02-14'
  },
  {
    id: '7',
    name: 'Jennifer Lee',
    age: 29,
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    email: 'jennifer.lee@email.com',
    lastVisit: '2025-06-21',
    consultationType: 'Follow-up',
    diagnosis: 'Asthma',
    status: 'active',
    pdfUrl: '#',
    testReports: ['Pulmonary Function Test'],
    createdAt: '2024-07-03'
  },
  {
    id: '8',
    name: 'Thomas Brown',
    age: 47,
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    email: 'thomas.brown@email.com',
    lastVisit: '2025-06-20',
    consultationType: 'In-person',
    diagnosis: 'High Cholesterol',
    status: 'active',
    pdfUrl: '#',
    testReports: ['Lipid Panel'],
    createdAt: '2024-04-18'
  }
];

// Dashboard/Homepage Component
export function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
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
          value={mockDashboardData.stats.totalPatients}
          icon="👥"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          textColor="text-blue-700"
          trend="+12% from last month"
        />
        <StatsCard
          title="Recent Prescriptions"
          value={mockDashboardData.stats.recentPrescriptions}
          subtitle="Last 7 days"
          icon="📝"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          textColor="text-green-700"
          trend="+8% from last week"
        />
        <StatsCard
          title="Today's Prescriptions"
          value={mockDashboardData.stats.todaysPrescriptions}
          subtitle="Today"
          icon="⚡"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          textColor="text-purple-700"
          trend="+3 since yesterday"
        />
        <StatsCard
          title="Active Patients"
          value={mockDashboardData.stats.activePatients}
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
              <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
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
              {mockDashboardData.recentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {mockDashboardData.recentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
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
            <QuickActionButton
              icon="👤"
              title="Add New Patient"
              description="Register a new patient in the system"
              action={() => console.log('Add patient')}
            />
            <QuickActionButton
              icon="📝"
              title="Create Prescription"
              description="Write a new prescription for existing patient"
              action={() => console.log('Create prescription')}
            />
            <QuickActionButton
              icon="📊"
              title="View Reports"
              description="Access patient reports and analytics"
              action={() => console.log('View reports')}
            />
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
    <button
      onClick={action}
      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

// Patients Page Component
export function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort patients
  const filteredPatients = mockPatientsData
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
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
