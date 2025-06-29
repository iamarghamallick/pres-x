"use client";
import React, { useRef, useEffect } from 'react'

const Prescription = ({ prescriptionData }) => {
    const { personalInfo, doctorInfo, consultationInfo, medications, prescription } = prescriptionData;
    const printRef = React.useRef(null);
    const handlePrint = () => {
        window.print();
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white text-black" ref={printRef}>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Prescription</h1>
                    <p className="text-sm">Generated on: {formatDate(prescription.generatedAt)}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{doctorInfo.doctorName}</p>
                    <p>{doctorInfo.specialization}</p>
                    <p>License: {doctorInfo.licenseNumber}</p>
                </div>
            </div>

            <section className="mb-4">
                <h2 className="font-semibold text-lg">Patient Details</h2>
                <p>Name: {personalInfo.name}</p>
                <p>Age/Gender: {personalInfo.age} / {personalInfo.gender}</p>
                {personalInfo.phone && <p>Phone: {personalInfo.phone}</p>}
            </section>

            <section className="mb-4">
                <h2 className="font-semibold text-lg">Consultation</h2>
                <p>Date: {formatDate(consultationInfo.consultationDate)}</p>
                <p>Type: {consultationInfo.consultationType}</p>
                <p>Chief Complaint: {consultationInfo.chiefComplaint}</p>
                <p>Diagnosis: {consultationInfo.diagnosis}</p>
                <p>Notes: {consultationInfo.notes}</p>
            </section>

            <section className="mb-4">
                <h2 className="font-semibold text-lg">Medications</h2>
                {medications.map((med, index) => (
                    <div key={index} className="border p-2 mb-2 rounded">
                        <p><strong>Name:</strong> {med.name}</p>
                        <p><strong>Dosage:</strong> {med.dosage}</p>
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        <p><strong>Duration:</strong> {med.duration}</p>
                        <p><strong>Instructions:</strong> {med.instructions}</p>
                    </div>
                ))}
            </section>

            <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
            >
                Print Prescription
            </button>
        </div>
    )
}

export default Prescription