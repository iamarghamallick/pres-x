'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Phone, Mail, AlertTriangle, TrendingUp, TrendingDown, Activity, FileText, Download, Play, Pause, Volume2 } from 'lucide-react';
import { patientService, prescriptionService } from '@/lib/firestore';
import { Patient, Prescription } from '@/types/firestore';

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface VitalTrend {
  date: string;
  bp?: string;
  weight?: number;
  spo2?: number;
}

interface VitalStats {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  // Unwrap the params Promise
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitalTrends, setVitalTrends] = useState<VitalTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'vitals' | 'reports'>('overview');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load patient details
        const patientData = await patientService.getPatientById(id);
        if (!patientData) {
          setError('Patient not found');
          return;
        }
        setPatient(patientData);

        // Load patient's prescriptions
        const patientPrescriptions = await prescriptionService.getPrescriptionsByPatient(id);
        setPrescriptions(patientPrescriptions);

        // Generate vital trends from prescriptions
        const trends = generateVitalTrends(patientPrescriptions);
        setVitalTrends(trends);

      } catch (err) {
        console.error('Error loading patient data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPatientData();
    }
  }, [id]);

  const generateVitalTrends = (prescriptions: Prescription[]): VitalTrend[] => {
    // Extract vitals from prescriptions (assuming vitals are stored in consultation notes or separate fields)
    // This is a simplified version - you might need to adjust based on your data structure
    return prescriptions
      .filter(p => p.consultationInfo?.notes)
      .map(p => ({
        date: p.consultationInfo.consultationDate.toDate().toISOString().split('T')[0],
        // Parse vitals from notes or use dedicated fields if available
        bp: extractVitalFromNotes(p.consultationInfo.notes || '', 'bp'),
        weight: parseFloat(extractVitalFromNotes(p.consultationInfo.notes || '', 'weight') || '0') || undefined,
        spo2: parseFloat(extractVitalFromNotes(p.consultationInfo.notes || '', 'spo2') || '0') || undefined,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const extractVitalFromNotes = (notes: string, type: string): string | undefined => {
    // Simple regex to extract vitals from notes
    const patterns = {
      bp: /bp:?\s*(\d+\/\d+)/i,
      weight: /weight:?\s*(\d+(?:\.\d+)?)/i,
      spo2: /spo2:?\s*(\d+)/i,
    };
    
    const match = notes.match(patterns[type as keyof typeof patterns]);
    return match ? match[1] : undefined;
  };

  const calculateVitalStats = (values: (number | undefined)[]): VitalStats | null => {
    const validValues = values.filter((v): v is number => v !== undefined);
    if (validValues.length < 2) return null;

    const current = validValues[validValues.length - 1];
    const previous = validValues[validValues.length - 2];
    const change = current - previous;
    const changePercent = (change / previous) * 100;

    return {
      current,
      previous,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  };

  const playAudio = async (audioUrl: string, recordingId: string) => {
    if (playingAudio === recordingId) {
      // Stop audio
      setPlayingAudio(null);
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      setPlayingAudio(recordingId);
      
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        alert('Failed to play audio recording');
      };
      
      await audio.play();
    } catch (error) {
      setPlayingAudio(null);
      alert('Failed to play audio recording');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700">{error || 'Patient not found'}</p>
              </div>
            </div>
            <Link href="/patients" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Back to Patients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const weightStats = calculateVitalStats(vitalTrends.map(v => v.weight));
  const spo2Stats = calculateVitalStats(vitalTrends.map(v => v.spo2));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/patients" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Patients</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/create?patientId=${patient.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                New Prescription
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {patient.personalInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{patient.personalInfo.name}</h1>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{patient.personalInfo.age} years • {patient.personalInfo.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{patient.personalInfo.phone}</span>
                </div>
                {patient.personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{patient.personalInfo.email}</span>
                  </div>
                )}
              </div>
              {patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Allergies: {patient.medicalInfo.allergies.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Patient since</div>
              <div className="font-semibold">{patient.createdAt.toDate().toLocaleDateString()}</div>
              <div className="text-sm text-gray-500 mt-1">
                Total Visits: {prescriptions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'prescriptions', label: 'Prescriptions' },
              { id: 'vitals', label: 'Vitals & Trends' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Medical Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.medicalInfo?.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chronic Conditions</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.medicalInfo?.chronicConditions?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.medicalInfo?.currentMedications?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.medicalInfo?.allergies?.join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
                <div className="space-y-4">
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {prescription.consultationInfo.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {prescription.consultationInfo.consultationDate.toDate().toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {prescription.medications.length} medication(s) prescribed
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {prescription.consultationInfo.conversationRecording && (
                            <button
                              onClick={() => playAudio(
                                prescription.consultationInfo.conversationRecording!.audioUrl,
                                prescription.consultationInfo.conversationRecording!.id
                              )}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                              title="Play Recording"
                            >
                              {playingAudio === prescription.consultationInfo.conversationRecording.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vital Trends Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Trends</h3>
                <div className="space-y-4">
                  {weightStats && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{weightStats.current} kg</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${
                          weightStats.trend === 'up' ? 'text-red-600' : 
                          weightStats.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {weightStats.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : weightStats.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {weightStats.changePercent > 0 ? '+' : ''}{weightStats.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {spo2Stats && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">SpO2</p>
                        <p className="text-lg font-semibold text-gray-900">{spo2Stats.current}%</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${
                          spo2Stats.trend === 'up' ? 'text-green-600' : 
                          spo2Stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {spo2Stats.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : spo2Stats.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {spo2Stats.changePercent > 0 ? '+' : ''}{spo2Stats.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {patient.personalInfo.emergencyContact && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{patient.personalInfo.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{patient.personalInfo.emergencyContact.relationship}</p>
                    <p className="text-sm text-gray-600">{patient.personalInfo.emergencyContact.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prescription.consultationInfo.diagnosis}</h3>
                    <p className="text-sm text-gray-600">
                      {prescription.consultationInfo.consultationDate.toDate().toLocaleDateString()} • 
                      {prescription.consultationInfo.consultationType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {prescription.consultationInfo.conversationRecording && (
                      <button
                        onClick={() => playAudio(
                          prescription.consultationInfo.conversationRecording!.audioUrl,
                          prescription.consultationInfo.conversationRecording!.id
                        )}
                        className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-md text-sm"
                      >
                        {playingAudio === prescription.consultationInfo.conversationRecording.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Recording</span>
                      </button>
                    )}
                    <button className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Chief Complaint</h4>
                    <p className="text-sm text-gray-600">{prescription.consultationInfo.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{prescription.consultationInfo.notes || 'No notes'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Medications</h4>
                  <div className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>{med.duration}</p>
                            {med.instructions && <p className="italic">{med.instructions}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs Trends</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO2 (%)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vitalTrends.map((vital, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(vital.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.bp || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.weight || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vital.spo2 || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Reports</h3>
              {prescriptions.some(p => p.testReports && p.testReports.length > 0) ? (
                <div className="space-y-4">
                  {prescriptions
                    .filter(p => p.testReports && p.testReports.length > 0)
                    .map(prescription => (
                      <div key={prescription.id}>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {prescription.consultationInfo.consultationDate.toDate().toLocaleDateString()}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {prescription.testReports!.map((report) => (
                            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">{report.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {report.uploadedAt.toDate().toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 capitalize">{report.testType}</p>
                                </div>
                                <button
                                  onClick={() => window.open(report.fileUrl, '_blank')}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No test reports available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
