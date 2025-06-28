// Firebase utility functions for PresX

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config'; // You'll need to create this
import { 
  Patient, 
  Prescription, 
  DashboardData, 
  PatientWithLatestPrescription,
  RecentActivity,
  COLLECTIONS 
} from '../types/firestore';
// Firebase Storage removed - using Supabase Storage instead
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Patient Operations
export const patientService = {
  // Create new patient
  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.PATIENTS), {
      ...patientData,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create recent activity
    await addDoc(collection(db, COLLECTIONS.RECENT_ACTIVITIES), {
      type: 'patient_added',
      patientId: docRef.id,
      patientName: patientData.personalInfo.name,
      timestamp: now,
      description: `New patient ${patientData.personalInfo.name} added`,
    });
    
    return docRef.id;
  },

  // Get patient by ID
  async getPatientById(patientId: string): Promise<Patient | null> {
    const docSnap = await getDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Patient;
    }
    return null;
  },

  // Get all active patients with pagination
  async getAllPatients(lastDoc?: QueryDocumentSnapshot, pageSize: number = 20): Promise<{
    patients: Patient[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
  }> {
    let q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(pageSize + 1)
    );

    if (lastDoc) {
      q = query(
        collection(db, COLLECTIONS.PATIENTS),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    const patients: Patient[] = [];
    let newLastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = false;

    querySnapshot.docs.forEach((doc, index) => {
      if (index < pageSize) {
        patients.push({ id: doc.id, ...doc.data() } as Patient);
        newLastDoc = doc;
      } else {
        hasMore = true;
      }
    });

    return { patients, lastDoc: newLastDoc, hasMore };
  },

  // Update patient
  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Soft delete patient
  async deactivatePatient(patientId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  },
};

// Prescription Operations
export const prescriptionService = {
  // Create new prescription
  async createPrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.PRESCRIPTIONS), {
      ...prescriptionData,
      createdAt: now,
      updatedAt: now,
    });

    // Create recent activity
    const patient = await patientService.getPatientById(prescriptionData.patientId);
    if (patient) {
      await addDoc(collection(db, COLLECTIONS.RECENT_ACTIVITIES), {
        type: 'prescription_created',
        patientId: prescriptionData.patientId,
        patientName: patient.personalInfo.name,
        prescriptionId: docRef.id,
        timestamp: now,
        description: `Prescription created for ${patient.personalInfo.name}`,
      });
    }

    return docRef.id;
  },

  // Get prescriptions for a patient
  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prescription));
  },

  // Get recent prescriptions for homepage
  async getRecentPrescriptions(limitCount: number = 5): Promise<Prescription[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prescription));
  },

  // Update prescription
  async updatePrescription(prescriptionId: string, updates: Partial<Prescription>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, prescriptionId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },
};

// Dashboard Operations
export const dashboardService = {
  // Get dashboard data for homepage
  async getDashboardData(): Promise<DashboardData> {
    // Get total patients count
    const patientsQuery = query(
      collection(db, COLLECTIONS.PATIENTS),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const totalPatients = patientsSnapshot.size;

    // Get recent prescriptions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPrescriptionsQuery = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
    );
    const recentPrescriptionsSnapshot = await getDocs(recentPrescriptionsQuery);
    const recentPrescriptions = recentPrescriptionsSnapshot.size;

    // Get today's prescriptions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPrescriptionsQuery = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow))
    );
    const todayPrescriptionsSnapshot = await getDocs(todayPrescriptionsQuery);
    const todaysPrescriptions = todayPrescriptionsSnapshot.size;

    // Get active patients (patients with prescriptions in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activePrescriptionsQuery = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const activePrescriptionsSnapshot = await getDocs(activePrescriptionsQuery);
    
    // Get unique patient IDs from recent prescriptions
    const activePatientIds = new Set(activePrescriptionsSnapshot.docs.map(doc => doc.data().patientId));
    const activePatients = activePatientIds.size;

    // Get recent patients with their latest prescriptions
    const recentPatientsData = await this.getRecentPatientsWithPrescriptions(5);

    // Get recent activities
    const activitiesQuery = query(
      collection(db, COLLECTIONS.RECENT_ACTIVITIES),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const recentActivities: RecentActivity[] = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecentActivity));

    return {
      stats: {
        totalPatients,
        recentPrescriptions,
        todaysPrescriptions,
        activePatients,
      },
      recentPatients: recentPatientsData,
      recentActivities,
    };
  },

  // Get recent patients with their latest prescriptions
  async getRecentPatientsWithPrescriptions(limitCount: number = 5): Promise<PatientWithLatestPrescription[]> {
    // Get recent prescriptions
    const recentPrescriptions = await prescriptionService.getRecentPrescriptions(limitCount);
    
    // Get patient data for each prescription
    const patientsWithPrescriptions: PatientWithLatestPrescription[] = [];
    
    for (const prescription of recentPrescriptions) {
      const patient = await patientService.getPatientById(prescription.patientId);
      if (patient) {
        patientsWithPrescriptions.push({
          ...patient,
          latestPrescription: {
            id: prescription.id,
            consultationDate: prescription.consultationInfo.consultationDate,
            pdfUrl: prescription.prescription.pdfUrl,
            status: prescription.status,
          },
        });
      }
    }

    return patientsWithPrescriptions;
  },

  // Update dashboard statistics (call this periodically or on data changes)
  async updateDashboardStats(): Promise<void> {
    const today = new Date();
    const statsId = `stats_${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, '0')}_${String(today.getDate()).padStart(2, '0')}`;
    
    // Calculate stats
    const totalPatientsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PATIENTS), where('isActive', '==', true))
    );
    const totalPatients = totalPatientsSnapshot.size;

    const totalPrescriptionsSnapshot = await getDocs(collection(db, COLLECTIONS.PRESCRIPTIONS));
    const totalPrescriptions = totalPrescriptionsSnapshot.size;

    // Today's prescriptions
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayPrescriptionsSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRESCRIPTIONS),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay))
      )
    );
    const prescriptionsToday = todayPrescriptionsSnapshot.size;

    // This week's prescriptions
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekPrescriptionsSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRESCRIPTIONS),
        where('createdAt', '>=', Timestamp.fromDate(startOfWeek))
      )
    );
    const prescriptionsThisWeek = weekPrescriptionsSnapshot.size;

    // This month's prescriptions
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthPrescriptionsSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRESCRIPTIONS),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      )
    );
    const prescriptionsThisMonth = monthPrescriptionsSnapshot.size;

    // Active patients (seen in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activePatientsSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRESCRIPTIONS),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      )
    );
    
    // Get unique patient IDs
    const uniquePatientIds = new Set(
      activePatientsSnapshot.docs.map(doc => doc.data().patientId)
    );
    const activePatients = uniquePatientIds.size;

    // Update or create stats document
    const statsData = {
      date: Timestamp.fromDate(today),
      totalPatients,
      totalPrescriptions,
      prescriptionsToday,
      prescriptionsThisWeek,
      prescriptionsThisMonth,
      activePatients,
      lastUpdated: Timestamp.now(),
    };

    await updateDoc(doc(db, COLLECTIONS.DASHBOARD_STATS, statsId), statsData);
  },
};

import { supabaseAudioService } from './supabase';

// Audio/File upload operations - now using Supabase Storage
export const audioService = supabaseAudioService;

// Search and Filter Operations
export const searchService = {
  // Search patients by name (basic text search)
  async searchPatientsByName(searchTerm: string): Promise<Patient[]> {
    // Note: This is a basic implementation. For better search, consider using Algolia or similar
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where('isActive', '==', true),
      orderBy('personalInfo.name')
    );
    
    const querySnapshot = await getDocs(q);
    const patients: Patient[] = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Patient))
      .filter(patient => 
        patient.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return patients;
  },

  // Filter prescriptions by date range
  async getPrescriptionsByDateRange(startDate: Date, endDate: Date): Promise<Prescription[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prescription));
  },
};

// Utility function to handle errors
export const handleFirestoreError = (error: any): string => {
  console.error('Firestore error:', error);
  
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'A document with this ID already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded. Please try again later.';
    case 'unauthenticated':
      return 'You must be logged in to perform this action.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
