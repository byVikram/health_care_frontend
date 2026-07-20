// // services/userService.ts
// import { API_ENDPOINTS } from "../constants/apiUrls";
// import ApiService from "./apiService";

// export interface User {
//   id: string | number;
//   [key: string]: unknown;
// }

// export const getUsers = async (): Promise<User[]> => {
//   const response = await ApiService.get<User[]>(API_ENDPOINTS.USERS.GET);
//   return response.data;
// };

// export const createUser = async (userData: Partial<User>): Promise<User> => {
//   const response = await ApiService.post<User>(API_ENDPOINTS.USERS.CREATE, userData);
//   return response.data;
// };

// export const updateUser = async (id: string | number, userData: Partial<User>): Promise<User> => {
//   const response = await ApiService.put<User>(API_ENDPOINTS.USERS.UPDATE(id), userData);
//   return response.data;
// };

// export const deleteUser = async (id: string | number): Promise<void> => {
//   const response = await ApiService.delete<void>(API_ENDPOINTS.USERS.DELETE(id));
//   return response.data;
// };


// services/userService.ts
import { API_ENDPOINTS } from "../constants/apiUrls";
import ApiService from "./apiService";



export const getUsers = async () => {
  const response = await ApiService.get(API_ENDPOINTS.USERS.GET);
  return response.data;
};

export const createUser = async (userData: Record<string, unknown>) => {
  const response = await ApiService.post(API_ENDPOINTS.USERS.CREATE, userData);
  return response.data;
};

export const updateUser = async (id: string | number, userData: Record<string, unknown>) => {
  const response = await ApiService.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
  return response.data;
};

export const deleteUser = async (id: string | number) => {
  const response = await ApiService.delete(API_ENDPOINTS.USERS.DELETE(id));
  return response.data;
};

export const getPatientDetails = async (patientId: string) => {
  const res = await ApiService.get(API_ENDPOINTS.PATIENT.GET_BY_ID(patientId));
  return res.data;
};

// GET /api/patients/me/details is patient-role-only and always resolves to the
// calling user's own record (no id needed) -- used instead of getPatientDetails
// when the viewer is the patient themselves, since GET_BY_ID is doctor-only.
export const getMyPatientDetails = async () => {
  const res = await ApiService.get(API_ENDPOINTS.PATIENT.ME);
  return res.data;
};

export const getAppointmentById = async (id: string) => {
  const res = await ApiService.get(API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(id))
  return res.data
};
