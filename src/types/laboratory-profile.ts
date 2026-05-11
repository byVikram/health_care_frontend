// src/types/laboratory-profile.ts

export interface LaboratoryProfilePersonal {
	name: string
	contactNumber: string
	contactVerified: boolean
	email: string
	emailVerified: boolean
	gender: string
	dateOfBirth: string
	location: string
	avatar: string
	instagram: string
	facebook: string
}

export interface LaboratoryProfileProfessional {
	labName: string
	registrationNumber: string
	registrationProof: string
	accreditationBody: string
	accreditationNumber: string
	accreditationProof: string
	about: string
	operatingSince: string
}

export interface LaboratoryService {
	id: string
	name: string
	category: string
	price: string
	turnaroundTime: string
	isActive: boolean
}

export interface LaboratoryProfile {
	id: string
	labType: string
	personal: LaboratoryProfilePersonal
	professional: LaboratoryProfileProfessional
	services: LaboratoryService[]
}
