// src/types/doctor.ts

export interface DoctorStats {
  patients: number;
  experience: number;
  ratings: number;
  reviews: number;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  distance: string;
}

export interface AppointmentType {
  id: "clinic" | "video";
  label: string;
  description: string;
  price: number;
  duration: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  clinicName: string;
  distance: string;
  secondaryLocation: string;
  secondaryDistance: string;
  stats: DoctorStats;
  recommendedPercentage:string;
  about: string;
  workingTime: string;
  hospitals: Hospital[];
  appointmentTypes: AppointmentType[];
}
