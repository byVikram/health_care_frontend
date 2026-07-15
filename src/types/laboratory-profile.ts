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
	specializationId: string
	specializationLabel: string
	degree: string
	institute: string
	yearOfPassing: string
	qualificationProof: string
	registrationNumber: string
	certificationAuthority: string
	licenseExpiryDate: string
	registrationProof: string
	currentLab: string
	yearsOfExperience: string
	previousOrganization: string
	areaOfExpertise: string
	skills: string[]
	labLicenseProof: string
	trainingCertificateProof: string
	internshipProof: string
	idVerificationProof: string
	about: string
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
