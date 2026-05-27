// src/types/patient.ts

export interface PatientPersonal {
  name: string;
  contact_number: string;
  contact_verified: boolean;
  email: string;
  email_verified: boolean;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  marital_status: string;
  height: string;
  weight: string;
  emergency_contact: { name: string; number: string };
  location: string;
  avatar: string;
}

export interface PatientMedical {
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  past_surgeries: string[];
  family_history: string[];
}

export interface PatientLifeStyle {
  smoking_status: string;
  alcohol_consumption: string;
  activity_level: string;
  diet_type: string;
  sleep_hours: string;
}

export interface Patient {
  id: string;
  personal: PatientPersonal;
  medical: PatientMedical;
  lifestyle: PatientLifeStyle;
}
