import Link from 'next/link';
import DoctorAssistantForm from '../create/page';

export default function Prescriptions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">PresX</Link>
              <span className="ml-2 text-sm text-gray-500">Prescription Management</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/patients" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                Patients
              </Link>
              <Link href="/prescriptions" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                Prescriptions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Create Prescription Form */}
      <main>
        <DoctorAssistantForm />
      </main>
    </div>
  );
}
