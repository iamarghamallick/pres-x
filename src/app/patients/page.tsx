"use client";

import { PatientsPage } from "../../components/Dashboard";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Patients() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/' },
    { name: 'Patients', href: '/patients', current: pathname === '/patients' },
    { name: 'Prescriptions', href: '/prescriptions', current: pathname === '/prescriptions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">PresX</span>
              </Link>

            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage patient records and medical information
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <PatientsPage />
        </div>
      </main>
    </div>
  );
}