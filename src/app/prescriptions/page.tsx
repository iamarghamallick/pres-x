import Link from 'next/link';

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

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Prescriptions</h1>
          <p className="text-gray-600 mb-8">
            Prescription management page coming soon! This will include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold mb-2">All Prescriptions</h3>
              <p className="text-sm text-gray-600">View and manage all prescriptions created</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold mb-2">Search & Filter</h3>
              <p className="text-sm text-gray-600">Find prescriptions by patient, date, or medication</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track prescription trends and statistics</p>
            </div>
          </div>
          <div className="mt-8">
            <Link 
              href="/patients" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Patients Page
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
