// src/types/patient.ts

export interface PatientPersonal {
  name: string;
  contactNumber: string;
  contactVerified: boolean;
  email: string;
  emailVerified: boolean;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  maritalStatus: string;
  height: string;
  weight: string;
  emergencyContact: { name: string; number: string };
  location: string;
  avatar: string;
}

export interface PatientMedical {
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastSurgeries: string;
  familyHistory: string;
}

export interface PatientLifeStyle {
  smokingStatus: string;
  alcoholConsumption: string;
  activityLevel: string;
  dietType: string;
  sleepHours: string;
}

export interface Patient {
  id: string;
  personal: PatientPersonal;
  medical: PatientMedical;
  lifeStyle: PatientLifeStyle;
}

