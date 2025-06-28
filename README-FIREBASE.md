# PresX Setup Guide - Firebase Integration

## 🚀 Quick Start

### 1. Firebase Project Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Required Services**
   - **Firestore Database**: Go to Firestore Database → Create database
   - **Authentication**: Go to Authentication → Get started
   - **Storage**: Go to Storage → Get started

3. **Get Configuration**
   - Go to Project Settings → General → Your apps
   - Click "Web app" icon and register your app
   - Copy the configuration object

### 2. Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add Your Firebase Config**
   ```bash
   # .env.local
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### 3. Firestore Security Rules

Go to Firestore Database → Rules and replace with:

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
    
    // Dashboard stats
    match /dashboardStats/{statsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Recent activities
    match /recentActivities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Firebase Storage Rules

Go to Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Prescription PDFs
    match /prescription-pdfs/{patientId}/{prescriptionId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Test reports
    match /test-reports/{patientId}/{prescriptionId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Required Firestore Indexes

Go to Firestore Database → Indexes and create these composite indexes:

1. **prescriptions collection**:
   - Collection ID: `prescriptions`
   - Fields: `patientId` (Ascending), `createdAt` (Descending)

2. **prescriptions collection** (status filter):
   - Collection ID: `prescriptions`
   - Fields: `status` (Ascending), `createdAt` (Descending)

3. **recentActivities collection**:
   - Collection ID: `recentActivities`
   - Fields: `timestamp` (Descending)

### 6. Authentication Setup

1. **Enable Email/Password Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

2. **Create Initial User** (Optional)
   - Go to Authentication → Users
   - Add user manually for testing

## 📁 Project Structure

```
src/
├── types/
│   └── firestore.ts          # TypeScript interfaces
├── lib/
│   ├── config.ts             # Firebase configuration
│   └── firestore.ts          # Database operations
├── components/
│   └── Dashboard.tsx         # Example components
└── docs/
    └── firestore-schema.md   # Database schema documentation
```

## 🎯 Usage Examples

### Creating a New Patient

```typescript
import { patientService } from '@/lib/firestore';

const newPatient = {
  personalInfo: {
    name: "John Doe",
    age: 35,
    gender: "male" as const,
    phone: "+1234567890",
    email: "john.doe@example.com",
  },
  isActive: true,
};

const patientId = await patientService.createPatient(newPatient);
```

### Creating a Prescription

```typescript
import { prescriptionService } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

const newPrescription = {
  patientId: "patient_id_here",
  consultationInfo: {
    consultationDate: Timestamp.now(),
    consultationType: "in-person" as const,
    chiefComplaint: "Fever and headache",
    diagnosis: "Viral fever",
  },
  medications: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "5 days",
      instructions: "Take after meals",
    }
  ],
  doctorInfo: {
    doctorId: "doctor_id",
    doctorName: "Dr. Smith",
    specialization: "General Medicine",
    licenseNumber: "MD12345",
  },
  prescription: {
    pdfUrl: "https://storage.googleapis.com/...",
    pdfFileName: "prescription_123.pdf",
    generatedAt: Timestamp.now(),
  },
  status: "active" as const,
};

const prescriptionId = await prescriptionService.createPrescription(newPrescription);
```

### Fetching Dashboard Data

```typescript
import { dashboardService } from '@/lib/firestore';

const dashboardData = await dashboardService.getDashboardData();
console.log(`Total patients: ${dashboardData.stats.totalPatients}`);
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Collections

### Main Collections:
- **`patients`** - Patient information and medical history
- **`prescriptions`** - Prescription details with medications and PDFs
- **`doctors`** - Doctor profiles (optional)
- **`dashboardStats`** - Aggregated statistics for dashboard
- **`recentActivities`** - Recent system activities

### Collection Relationships:
- `prescriptions.patientId` → `patients.id`
- `prescriptions.doctorInfo.doctorId` → `doctors.id`

## 🎨 UI Components

The example components in `src/components/Dashboard.tsx` include:

- **Dashboard**: Homepage with stats and recent patients
- **PatientsPage**: Complete patient list with search
- **StatsCard**: Reusable statistics display
- **PatientCard**: Patient information card
- **ActivityCard**: Recent activity display

## 🔐 Security Features

- Authentication required for all database operations
- Row-level security through Firestore rules
- Secure file storage with Firebase Storage
- Environment variables for sensitive configuration

## 📈 Performance Optimization

- Pagination support for large patient lists
- Composite indexes for efficient queries
- Caching strategies for dashboard statistics
- Batch operations for related data updates

## 🚀 Deployment

### Vercel Deployment:
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📝 Next Steps

1. **Customize the UI** to match your brand
2. **Add authentication** components
3. **Implement PDF generation** for prescriptions
4. **Add file upload** for test reports
5. **Set up backup** and monitoring
6. **Add email notifications** for patients
7. **Implement role-based access** control

## 🆘 Troubleshooting

### Common Issues:

1. **Firebase not initialized**
   - Check environment variables are set correctly
   - Verify Firebase config in `.env.local`

2. **Permission denied errors**
   - Ensure user is authenticated
   - Check Firestore security rules

3. **Index errors**
   - Create required composite indexes in Firestore console
   - Wait for indexes to build (can take a few minutes)

4. **TypeScript errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check import paths are correct

For more help, check the [Firebase documentation](https://firebase.google.com/docs) or open an issue on the project repository.
