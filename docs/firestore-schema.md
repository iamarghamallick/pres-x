# Firebase Firestore Database Schema - PresX

## Overview
This document outlines the Firestore database structure for the PresX prescription management system.

## Collections Structure

### 1. `patients` Collection
**Purpose**: Store patient information and basic details
**Document ID**: Auto-generated unique ID

```
patients/{patientId}
├── personalInfo/
│   ├── name: string
│   ├── age: number
│   ├── gender: "male" | "female" | "other"
│   ├── phone: string
│   ├── email?: string
│   ├── address?: string
│   └── emergencyContact?: {
│       ├── name: string
│       ├── phone: string
│       └── relationship: string
│   }
├── medicalInfo?/
│   ├── bloodGroup?: string
│   ├── allergies?: string[]
│   ├── chronicConditions?: string[]
│   └── currentMedications?: string[]
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── isActive: boolean
```

### 2. `prescriptions` Collection
**Purpose**: Store prescription details linked to patients
**Document ID**: Auto-generated unique ID

```
prescriptions/{prescriptionId}
├── patientId: string (reference to patients/{patientId})
├── consultationInfo/
│   ├── consultationDate: Timestamp
│   ├── consultationType: "in-person" | "teleconsultation" | "follow-up"
│   ├── chiefComplaint: string
│   ├── diagnosis: string
│   └── notes?: string
├── medications: Array<{
│   ├── name: string
│   ├── dosage: string
│   ├── frequency: string
│   ├── duration: string
│   ├── instructions?: string
│   ├── quantity?: number
│   └── refills?: number
│ }>
├── doctorInfo/
│   ├── doctorId: string
│   ├── doctorName: string
│   ├── specialization: string
│   └── licenseNumber: string
├── prescription/
│   ├── pdfUrl: string (Firebase Storage URL)
│   ├── pdfFileName: string
│   ├── generatedAt: Timestamp
│   └── expiresAt?: Timestamp
├── testReports?: Array<{
│   ├── id: string
│   ├── name: string
│   ├── fileUrl: string (Firebase Storage URL)
│   ├── fileName: string
│   ├── uploadedAt: Timestamp
│   ├── reportDate?: Timestamp
│   ├── testType: "blood" | "urine" | "imaging" | "biopsy" | "other"
│   └── notes?: string
│ }>
├── status: "active" | "fulfilled" | "expired" | "cancelled"
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 3. `doctors` Collection (Optional - for multi-doctor setup)
**Purpose**: Store doctor information
**Document ID**: Auto-generated unique ID

```
doctors/{doctorId}
├── personalInfo/
│   ├── name: string
│   ├── specialization: string
│   ├── licenseNumber: string
│   ├── phone: string
│   └── email: string
├── credentials/
│   ├── degree: string[]
│   ├── experience: number
│   └── certifications?: string[]
├── clinicInfo?/
│   ├── clinicName: string
│   ├── address: string
│   └── timings: string
├── isActive: boolean
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 4. `dashboardStats` Collection
**Purpose**: Store aggregated statistics for dashboard
**Document ID**: Date-based (e.g., "stats_2025_06_28")

```
dashboardStats/{statsId}
├── date: Timestamp
├── totalPatients: number
├── totalPrescriptions: number
├── prescriptionsToday: number
├── prescriptionsThisWeek: number
├── prescriptionsThisMonth: number
├── activePatients: number
└── lastUpdated: Timestamp
```

### 5. `recentActivities` Collection
**Purpose**: Track recent activities for homepage display
**Document ID**: Auto-generated unique ID

```
recentActivities/{activityId}
├── type: "prescription_created" | "patient_added" | "test_uploaded"
├── patientId: string (reference to patients/{patientId})
├── patientName: string
├── prescriptionId?: string
├── timestamp: Timestamp
└── description: string
```

## Indexes Required

### Composite Indexes
1. **prescriptions collection**:
   - `patientId` (Ascending) + `createdAt` (Descending)
   - `status` (Ascending) + `createdAt` (Descending)
   - `doctorInfo.doctorId` (Ascending) + `createdAt` (Descending)

2. **recentActivities collection**:
   - `timestamp` (Descending)

3. **patients collection**:
   - `isActive` (Ascending) + `updatedAt` (Descending)

### Single Field Indexes
- All Timestamp fields should be indexed for efficient querying

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Patients collection
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    
    // Prescriptions collection
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null;
    }
    
    // Doctors collection
    match /doctors/{doctorId} {
      allow read, write: if request.auth != null;
    }
    
    // Dashboard stats (read-only for most users)
    match /dashboardStats/{statsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add role-based restrictions
    }
    
    // Recent activities
    match /recentActivities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Firebase Storage Structure

```
prescription-pdfs/
├── {patientId}/
│   └── {prescriptionId}/
│       └── prescription_{timestamp}.pdf

test-reports/
├── {patientId}/
│   └── {prescriptionId}/
│       ├── blood_report_{timestamp}.pdf
│       ├── xray_{timestamp}.jpg
│       └── ...
```

## Query Examples

### Homepage - Get Recent Patients (3-5 entries)
```typescript
const recentPatientsQuery = query(
  collection(db, 'prescriptions'),
  orderBy('createdAt', 'desc'),
  limit(5)
);
```

### Patient Page - Get All Patients with Latest Prescription
```typescript
const allPatientsQuery = query(
  collection(db, 'patients'),
  where('isActive', '==', true),
  orderBy('updatedAt', 'desc')
);
```

### Get Prescriptions for Specific Patient
```typescript
const patientPrescriptionsQuery = query(
  collection(db, 'prescriptions'),
  where('patientId', '==', patientId),
  orderBy('createdAt', 'desc')
);
```

## Performance Considerations

1. **Pagination**: Use `startAfter()` and `limit()` for large patient lists
2. **Caching**: Implement proper caching for dashboard statistics
3. **Batch Operations**: Use batch writes when creating prescription + activity records
4. **File Size Limits**: Implement file size restrictions for PDF and test report uploads
5. **Data Retention**: Consider implementing data archival for old prescriptions

## Migration Strategy

1. Start with `patients` and `prescriptions` collections
2. Add `recentActivities` for homepage functionality
3. Implement `dashboardStats` for performance optimization
4. Add `doctors` collection if multi-doctor support is needed

This schema provides a solid foundation for your prescription management system with room for future enhancements.
