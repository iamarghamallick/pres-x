'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Check, ChevronRight, ChevronLeft, User, Activity, Stethoscope, FileText, Pill, MessageSquare, Send, FileCheck, Volume2, Loader2 } from 'lucide-react';
import { patientService, prescriptionService, searchService, audioService } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Patient } from '@/types/firestore';
import { createClient } from '@supabase/supabase-js';
import PredictionResult from '@/components/PredictionResult';
import Prescription from '@/components/Prescription';

type Medication = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type FormData = {
  patientType: string;
  patientInfo: {
    name: string;
    age: string;
    gender: string;
    medicalHistory: string;
    phone: string;
  };
  vitals: {
    bp: string;
    spo2: string;
    weight: string;
  };
  symptoms: string;
  tests: string[];
  medications: Medication[];
  advice: string;
  testReports: any[]; // You can type this more strictly if you know the structure
};

const allSymptoms = [
  "Fever", "Cough", "Headache", "Sore throat", "Fatigue",
  "Body ache", "Loss of appetite", "Nausea", "Vomiting", "Diarrhea",
  "Shortness of breath", "Dizziness", "Chest pain", "Chills", "Sweating",
  "Runny nose", "Sneezing", "Joint pain", "Muscle cramps", "Blurred vision"
  // Add more as needed...
];

const commonTests = [
  "CBC", "CRP", "Chest X-ray", "Liver Function Test", "Kidney Function Test",
  "ECG", "MRI", "Blood Sugar", "Urine Routine", "D-Dimer", "CT Scan", "TSH", "Hemoglobin", "ESR"
];

const DoctorAssistantForm = () => {

  const [formData, setFormData] = useState<FormData>({
    patientType: '',
    patientInfo: { name: '', age: '', gender: '', medicalHistory: '', phone: '' },
    vitals: { bp: '', spo2: '', weight: '' },
    symptoms: '',
    tests: [],
    medications: [],
    advice: '',
    testReports: [],
  });

  const [loading, setLoading] = useState(false);


  const [predictionData, setPredictionData] = useState(null);
  const [presxData, setPresxData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredSymptoms = searchQuery
    ? allSymptoms.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allSymptoms.slice(0, 6); // Show only first 6 initially

  const addSymptom = (symptom) => {
    const current = formData.symptoms || "";
    const symptomsList = current.split(",").map((s) => s.trim());
    if (!symptomsList.includes(symptom)) {
      const updated = current ? `${current}, ${symptom}` : symptom;
      handleInputChange("symptoms", updated);
    }
  };

  // const [searchQuery, setSearchQuery] = useState('');

  // const updateTest = (index, value) => {
  //   const updated = [...formData.tests];
  //   updated[index] = value;
  //   setFormData(prev => ({ ...prev, tests: updated }));
  // };

  // const addTest = () => {
  //   setFormData(prev => ({ ...prev, tests: [...prev.tests, ''] }));
  // };

  const addTestFromSuggestion = (testName) => {
    if (!formData.tests.includes(testName)) {
      setFormData(prev => ({ ...prev, tests: [...prev.tests, testName] }));
    }
  };

  const filteredTests = commonTests.filter(test =>
    test.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!formData?.tests || !formData.tests.includes(test))
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Patient search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const router = useRouter();
  // const [formData, setFormData] = useState<FormData>({
  //   patientType: '',
  //   patientInfo: {
  //     name: '',
  //     age: '',
  //     gender: '',
  //     medicalHistory: ''
  //   },
  //   vitals: {
  //     bp: '',
  //     spo2: '',
  //     weight: ''
  //   },
  //   symptoms: '',
  //   tests: [],
  //   medications: [],
  //   advice: '',
  //   testReports: []
  // });

  const steps = [
    { id: 0, name: 'Patient Info', icon: User },
    { id: 1, name: 'Vitals', icon: Activity },
    { id: 2, name: 'Symptoms', icon: Stethoscope },
    { id: 3, name: 'Tests', icon: FileText },
    { id: 4, name: 'Medication', icon: Pill },
    { id: 5, name: 'Advice', icon: MessageSquare },
    { id: 6, name: 'Review', icon: FileCheck }
  ];

  const handleInputChange = (field: string, value: string, nested?: string | null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...((prev[nested as keyof FormData] && typeof prev[nested as keyof FormData] === 'object' && !Array.isArray(prev[nested as keyof FormData]))
            ? (prev[nested as keyof FormData] as Record<string, any>)
            : {}),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingStartTime(new Date());
      setRecordingDuration(0);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Update duration every second
      const interval = setInterval(() => {
        if (recorder.state === 'recording') {
          setRecordingDuration(prev => prev + 1);
        } else {
          clearInterval(interval);
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!formData.patientInfo.name || !formData.patientInfo.age || !formData.patientInfo.gender) {
        throw new Error('Please fill in all required patient information fields');
      }

      let patientId: string;

      if (formData.patientType === 'new') {
        // Create new patient
        const patientData = {
          personalInfo: {
            name: formData.patientInfo.name,
            age: parseInt(formData.patientInfo.age),
            gender: formData.patientInfo.gender as 'male' | 'female' | 'other',
            phone: formData.patientInfo.phone || '', // We can add phone field to the form later
          },
          ...(formData.patientInfo.medicalHistory && {
            medicalInfo: {
              chronicConditions: [formData.patientInfo.medicalHistory]
            }
          }), // Only include if medical history exists
          isActive: true,
        };

        patientId = await patientService.createPatient(patientData);
      } else {
        // Use selected existing patient
        if (!selectedPatientId) {
          throw new Error('Please select an existing patient or choose to create a new one');
        }
        patientId = selectedPatientId;
      }

      // Handle conversation recording upload
      let conversationRecording = undefined;
      if (hasRecording && audioChunks.length > 0) {
        setUploadingAudio(true);

        try {
          // Create blob from audio chunks
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const fileName = `consultation_${patientId}_${Date.now()}.webm`;

          // Create a download link
          const url = URL.createObjectURL(audioBlob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();

          // Clean up
          URL.revokeObjectURL(url);
          document.body.removeChild(a);

          // Upload to Supabase Storage
          // const uploadResult = await audioService.uploadRecording(audioBlob, fileName);

          // conversationRecording = {
          //   id: `recording_${Date.now()}`,
          //   audioUrl: uploadResult.audioUrl,
          //   fileName: uploadResult.fileName,
          //   duration: recordingDuration,
          //   uploadedAt: Timestamp.now(),
          //   fileSize: uploadResult.fileSize,
          // };
        } catch (audioError) {
          console.error('Error uploading recording:', audioError);
          // Don't fail the entire prescription creation if audio upload fails
          // alert('Warning: Failed to upload conversation recording, but prescription will still be created.');
        } finally {
          setUploadingAudio(false);
        }
      }

      // Create prescription with conversation recording
      const prescriptionData = {
        personalInfo: {
          name: formData.patientInfo.name,
          age: parseInt(formData.patientInfo.age),
          gender: formData.patientInfo.gender as 'male' | 'female' | 'other',
          phone: formData.patientInfo.phone || '', // Optional field
        },
        patientId,
        consultationInfo: {
          consultationDate: Timestamp.now(),
          consultationType: 'in-person' as const,
          chiefComplaint: formData.symptoms || 'No specific complaint',
          diagnosis: formData.symptoms || 'General consultation',
          ...(formData.advice && { notes: formData.advice }), // Only include if exists
          ...(conversationRecording && { conversationRecording }), // Only include if exists
        },
        medications: formData.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.instructions,
          duration: med.duration,
          instructions: med.instructions,
        })),
        doctorInfo: {
          doctorId: 'default-doctor', // We can implement doctor management later
          doctorName: 'Dr. John Smith',
          specialization: 'General Medicine',
          licenseNumber: 'MED12345',
        },
        prescription: {
          pdfUrl: '', // We can implement PDF generation later
          pdfFileName: `prescription_${Date.now()}.pdf`,
          generatedAt: Timestamp.now(),
        },
        ...(formData.tests.length > 0 && {
          testReports: formData.tests.map((test, index) => ({
            id: `test_${index}`,
            name: test,
            fileUrl: '',
            fileName: `${test.replace(/\s+/g, '_')}.pdf`,
            uploadedAt: Timestamp.now(),
            testType: 'other' as const,
          }))
        }), // Only include if there are tests
        status: 'active' as const,
      };

      console.log('Prescription data being sent to Firestore:', JSON.stringify(prescriptionData, null, 2));
      setPresxData(prescriptionData);

      await prescriptionService.createPrescription(prescriptionData);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        // router.push('/');
        setSubmitSuccess(true);
      }, 2000);

    } catch (error) {
      console.error('Error submitting prescription:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatFormData = (symptoms) => {
    return symptoms
      .split(',')
      .map(symptom => symptom.trim())
      .filter(symptom => symptom.length > 0)
      .join(', ');
  }

  const nextStep = async () => {
    if (currentStep === 2) {
      console.log("Predicting deasease based on symptoms:", formData.symptoms);

      const newFormData = new FormData();
      newFormData.append("custom_symptoms", formatFormData(formData.symptoms));

      try {
        setLoading(true);
        const response = await fetch(`https://medicare-4ae8.onrender.com/predict`, {
          method: "POST",
          body: newFormData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        setPredictionData(data);
        console.log("Prediction data received:", data);
        setLoading(false);
      } catch (error) {
        console.error("Prediction error:", error);
        // alert("Something went wrong with prediction.");
        setLoading(false);
      }
    }

    if (currentStep === 5) {

    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', duration: '', instructions: '' }]
    }));
  };

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const updatedMeds = [...formData.medications];
    updatedMeds[index] = {
      ...updatedMeds[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, medications: updatedMeds }));
  };

  const addTest = () => {
    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, '']
    }));
  };

  const updateTest = (index: number, value: string) => {
    const updatedTests = [...formData.tests];
    updatedTests[index] = value;
    setFormData(prev => ({ ...prev, tests: updatedTests }));
  };

  // Patient search handler
  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchService.searchPatientsByName(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setFormData(prev => ({
      ...prev,
      patientInfo: {
        name: patient.personalInfo.name,
        age: patient.personalInfo.age.toString(),
        gender: patient.personalInfo.gender,
        medicalHistory: patient.medicalInfo?.chronicConditions?.join(', ') || '',
        phone: patient.personalInfo.phone || ''
      }
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Information</h2>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <label className="block text-sm font-medium text-black mb-2">Patient Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputChange('patientType', 'new')}
                  className={`p-4 rounded-lg border-2 transition-all text-black ${formData.patientType === 'new'
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  New Patient
                </button>
                <button
                  onClick={() => handleInputChange('patientType', 'existing')}
                  className={`p-4 rounded-lg border-2 transition-all text-black ${formData.patientType === 'existing'
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Existing Patient
                </button>
              </div>
            </div>

            {formData.patientType === 'existing' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient name or ID"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>

                {isSearching && (
                  <div className="mt-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-4 bg-white rounded-lg shadow-md">
                    <ul className="divide-y divide-gray-200">
                      {searchResults.map(patient => (
                        <li
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="flex items-center text-black justify-between p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-black">{patient.personalInfo.name}</p>
                            <p className="text-sm text-black">{patient.id}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-black" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.patientInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value, 'patientInfo')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.patientInfo.age}
                  onChange={(e) => handleInputChange('age', e.target.value, 'patientInfo')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.patientInfo.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value, 'patientInfo')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.patientInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'patientInfo')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient phone number (or telegram id)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                <textarea
                  value={formData.patientInfo.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value, 'patientInfo')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Previous conditions, allergies, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Vital Signs</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                <input
                  type="text"
                  value={formData.vitals.bp}
                  onChange={(e) => handleInputChange('bp', e.target.value, 'vitals')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="120/80"
                />
                <p className="text-xs text-gray-500 mt-1">mmHg</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">SpO2</label>
                <input
                  type="number"
                  value={formData.vitals.spo2}
                  onChange={(e) => handleInputChange('spo2', e.target.value, 'vitals')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="98"
                />
                <p className="text-xs text-gray-500 mt-1">%</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="number"
                  value={formData.vitals.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value, 'vitals')}
                  className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="70"
                />
                <p className="text-xs text-gray-500 mt-1">kg</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Symptoms</h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Speak or type the patient's symptoms
              </p>
            </div>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Symptom grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition"
                  type="button"
                >
                  {symptom}
                </button>
              ))}
              {filteredSymptoms.length === 0 && (
                <p className="col-span-full text-sm text-gray-500">No matches found</p>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              className="w-full p-4 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Patient reports headache, fever for 2 days, body ache, loss of appetite..."
              rows={8}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Test Prescription</h2>

            {/* Test Suggestions with Search */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search common tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex flex-wrap gap-2">
                {filteredTests.map((test, idx) => (
                  <button
                    key={idx}
                    onClick={() => addTestFromSuggestion(test)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition"
                  >
                    {test}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Test Inputs */}
            <div className="space-y-4">
              {formData.tests.map((test, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={test}
                    onChange={(e) => updateTest(index, e.target.value)}
                    className="flex-1 p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E.g., CBC, CRP, Chest X-ray"
                  />
                  <button
                    onClick={() => {
                      const updatedTests = formData.tests.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, tests: updatedTests }));
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={addTest}
                className="w-full text-black p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                + Add Test
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Medication Prescription</h2>

            <div className="space-y-4">
              {formData.medications.map((med, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name"
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dosage (e.g., 500mg)"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Duration (e.g., 5 days)"
                    />
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Instructions (e.g., TDS, after food)"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updatedMeds = formData.medications.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, medications: updatedMeds }));
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={addMedication}
                className="w-full p-3 border-2 text-black border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                + Add Medication
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Advice & Follow-up</h2>

            <textarea
              value={formData.advice}
              onChange={(e) => handleInputChange('advice', e.target.value)}
              className="w-full p-4 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Drink plenty of fluids, rest well, avoid cold foods. Follow-up after 5 days or if symptoms worsen..."
              rows={8}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Prescription</h2>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <strong>Error:</strong> {submitError}
                </div>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Prescription created successfully!
                    {hasRecording && ' Conversation recording uploaded.'}
                    Redirecting to dashboard...
                  </span>
                </div>
              </div>
            )}

            {uploadingAudio && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading conversation recording...</span>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div className="border-b text-black pb-4">
                <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                <p className="text-gray-600">Type: {formData.patientType || 'Not selected'}</p>
                <p className="text-gray-600">Name: {formData.patientInfo.name || 'Not provided'}</p>
                <p className="text-gray-600">Age: {formData.patientInfo.age || 'Not provided'}</p>
                <p className="text-gray-600">Gender: {formData.patientInfo.gender || 'Not provided'}</p>
                {formData.patientInfo.medicalHistory && (
                  <p className="text-gray-600">Medical History: {formData.patientInfo.medicalHistory}</p>
                )}
                <p className="text-gray-600">Name: {formData.patientInfo.phone || 'Not provided'}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-black text-lg mb-2">Conversation Recording</h3>
                {hasRecording ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>Recorded conversation ({formatDuration(recordingDuration)})</span>
                  </div>
                ) : (
                  <p className="text-gray-600">No conversation recorded</p>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-black text-lg mb-2">Vitals</h3>
                <p className="text-gray-600">BP: {formData.vitals.bp || 'Not recorded'}</p>
                <p className="text-gray-600">SpO2: {formData.vitals.spo2 || 'Not recorded'}%</p>
                <p className="text-gray-600">Weight: {formData.vitals.weight || 'Not recorded'} kg</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-black text-lg mb-2">Symptoms</h3>
                <p className="text-gray-600">{formData.symptoms || 'No symptoms recorded'}</p>
              </div>

              {formData.tests.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-black text-lg mb-2">Tests Prescribed</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {formData.tests.map((test, index) => (
                      <li key={index}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.medications.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-black text-lg mb-2">Medications</h3>
                  {formData.medications.map((med, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-gray-800 font-medium">{med.name}</p>
                      <p className="text-gray-600 text-sm">
                        {med.dosage} - {med.instructions} - {med.duration}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-black text-lg mb-2">Advice</h3>
                <p className="text-gray-600">{formData.advice || 'No advice recorded'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || submitSuccess}
                className={`flex-1 p-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isSubmitting || submitSuccess
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Prescription...
                  </>
                ) : submitSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Created Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create Prescription
                  </>
                )}
              </button>
              <button
                disabled={isSubmitting || submitSuccess}
                className={`px-6 py-4 rounded-lg transition-colors ${isSubmitting || submitSuccess
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
              >
                Print Preview
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Cleanup function to stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {!presxData && <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Stethoscope className="w-8 h-8" />
                  Smart Doctor's Assistant
                </h1>
                <p className="mt-2 text-blue-100">Voice-First Digital Consultation System</p>
              </div>

              {/* Recording Status */}
              <div className="text-right">
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording: {formatDuration(recordingDuration)}</span>
                  </div>
                )}
                {hasRecording && !isRecording && (
                  <div className="flex items-center gap-2 bg-green-500 px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Recorded: {formatDuration(recordingDuration)}</span>
                  </div>
                )}
                {!hasRecording && !isRecording && (
                  <div className="text-blue-100 text-sm">
                    Click microphone to start recording
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-500'
                        }`}
                    >
                      {index < currentStep ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center">{step.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 h-1 bg-gray-300 w-full rounded"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-blue-600 rounded transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {predictionData && <PredictionResult predictionData={predictionData} />}
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="p-6 bg-gray-50 flex justify-between items-center">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${currentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Voice Recording Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleRecording}
                className={`p-4 rounded-full transition-all transform hover:scale-105 ${isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : hasRecording
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                title={isRecording ? 'Stop Recording' : hasRecording ? 'Recording Complete' : 'Start Recording'}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <span className="text-xs text-gray-600 text-center">
                {isRecording ? 'Recording...' : hasRecording ? 'Recorded' : 'Record'}
              </span>
            </div>

            <button
              onClick={nextStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${currentStep === steps.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              disabled={currentStep === steps.length - 1}
            >
              {loading ? "Loading..." : "Next"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>}

        {presxData && submitSuccess && <Prescription prescriptionData={presxData} />}
      </div>
    </div>
  );
};

export default DoctorAssistantForm;