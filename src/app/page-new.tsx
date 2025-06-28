import { Dashboard } from "../components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PresX</h1>
              <span className="ml-2 text-sm text-gray-500">Prescription Management</span>
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/patients" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                Patients
              </a>
              <a href="/prescriptions" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">
                Prescriptions
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 PresX. Built with Next.js, TypeScript, and Firebase.</p>
            <p className="mt-2">
              📚 Check out the{" "}
              <a 
                href="/README-FIREBASE.md" 
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
              >
                setup guide
              </a>{" "}
              to get started with Firebase integration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
