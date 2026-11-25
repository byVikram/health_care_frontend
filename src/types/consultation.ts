// src/types/consultation.ts

export interface ConsultationEmergencyContact {
  name: string;
  relation: string;
  number: string;
}

export interface ConsultationPatient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  phoneVerified: boolean;
  email: string;
  avatar: string;
  dateOfBirth: string;
  maritalStatus: string;
  weight: string;
  height: string;
  bloodGroup: string;
  address: string;
  occupation: string;
  emergencyContact: ConsultationEmergencyContact;
  chronicDiseases: string[];
  allergies: string[];
  smokingStatus: string;
  alcoholConsumption: string;
  dietType: string;
}

export interface ConsultationDoctor {
  name: string;
  degree: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
}
/** How a reading rates: normal / medium / high, decided by the backend (features/consultation/vitalRating.ts); unset = not rated. */
export type VitalRating = "unset" | "normal" | "medium" | "high";

export interface VitalStat {
  id: string;
  label: string;
  value: string;
  unit: string;
  date: string;
  rating?: VitalRating;
}

export interface VitalReading {
  value: string;
  time: string;
  status: "normal" | "abnormal";
}

export interface VitalHistoryRow {
  id: string;
  date: string;
  cells: Record<string, string>;
  cellStatus?: Record<string, VitalRating>;
  hasDownload?: boolean;
}