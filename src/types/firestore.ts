// Firebase Firestore Schema Types for PresX - Prescription Management System

import { Timestamp } from 'firebase/firestore';

// Main Patient Document Interface
export interface Patient {
  id: string; // Document ID
  personalInfo: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean; // For soft delete functionality
}

// Conversation Recording Interface
export interface ConversationRecording {
  id: string;
  audioUrl: string;
  fileName: string;
  duration: number; // in seconds
  uploadedAt: Timestamp;
  transcription?: string; // Optional AI transcription
  fileSize: number; // in bytes
}

// Prescription Document Interface
export interface Prescription {
  id: string; // Document ID
  patientId: string; // Reference to Patient document
  consultationInfo: {
    consultationDate: Timestamp;
    consultationType: 'in-person' | 'teleconsultation' | 'follow-up';
    chiefComplaint: string;
    diagnosis: string;
    notes?: string;
    conversationRecording?: ConversationRecording; // Made optional
  };
  medications: Medication[];
  doctorInfo: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    licenseNumber: string;
  };
  prescription: {
    pdfUrl: string; // Supabase Storage URL for generated PDF
    pdfFileName: string;
    generatedAt: Timestamp;
    expiresAt?: Timestamp; // Optional expiration date
  };
  testReports?: TestReport[];
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Medication Interface
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  refills?: number;
}

// Test Report Interface
export interface TestReport {
  id: string;
  name: string;
  fileUrl: string; // Supabase Storage URL
  fileName: string;
  uploadedAt: Timestamp;
  reportDate?: Timestamp;
  testType: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'other';
  notes?: string;
}

// Doctor Document Interface (if you plan to have multiple doctors)
export interface Doctor {
  id: string; // Document ID
  personalInfo: {
    name: string;
    specialization: string;
    licenseNumber: string;
    phone: string;
    email: string;
  };
  credentials: {
    degree: string[];
    experience: number; // years
    certifications?: string[];
  };
  clinicInfo?: {
    clinicName: string;
    address: string;
    timings: string;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Analytics/Dashboard Data Interface
export interface DashboardStats {
  id: string; // Document ID (could be date-based like 'stats_2025_06_28')
  date: Timestamp;
  totalPatients: number;
  totalPrescriptions: number;
  prescriptionsToday: number;
  prescriptionsThisWeek: number;
  prescriptionsThisMonth: number;
  activePatients: number; // Patients seen in last 30 days
  lastUpdated: Timestamp;
}

// Recent Activity Interface for homepage
export interface RecentActivity {
  id: string;
  type: 'prescription_created' | 'patient_added' | 'test_uploaded';
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  timestamp: Timestamp;
  description: string;
}

// Query Result Interfaces for component props
export interface PatientWithLatestPrescription extends Patient {
  latestPrescription?: {
    id: string;
    consultationDate: Timestamp;
    pdfUrl: string;
    status: string;
  };
}

export interface DashboardData {
  stats: {
    totalPatients: number;
    recentPrescriptions: number;
    todaysPrescriptions: number;
    activePatients: number;
  };
  recentPatients: PatientWithLatestPrescription[];
  recentActivities: RecentActivity[];
}

// Firebase Collection Names (for consistency)
export const COLLECTIONS = {
  PATIENTS: 'patients',
  PRESCRIPTIONS: 'prescriptions',
  DOCTORS: 'doctors',
  DASHBOARD_STATS: 'dashboardStats',
  RECENT_ACTIVITIES: 'recentActivities',
} as const;

// Firestore Security Rules Helpers
export type FirestoreDocument = Patient | Prescription | Doctor | DashboardStats | RecentActivity;
