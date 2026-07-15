export interface RadiologyProfileProfessional {
	degree: string
	postGraduation: string
	college: string
	yearOfPassing: string
	qualificationProof: string

	registrationNumber: string
	registrationCouncil: string
	registrationProof: string
	subSpecializations: string[]
	imagingModalities: string[]
	yearsOfExperience: string
	currentHospital: string
	

	certifications: string[]
	memberships: string[]
	certificationProof: string

	teleradiologyAvailable: string

	reportingHours: string
	timezoneCoverage: string

	about: string
}

export const EMPTY_RADIOLOGY_PROFESSIONAL: RadiologyProfileProfessional = {
	degree: '',
	postGraduation: '',
	college: '',
	yearOfPassing: '',
	qualificationProof: '',

	registrationNumber: '',
	registrationCouncil: '',
	registrationProof: '',

	subSpecializations: [],
	imagingModalities: [],
	yearsOfExperience: '',
	currentHospital: '',

	certifications: [],
	memberships: [],
	certificationProof: '',

	teleradiologyAvailable: 'no',

	reportingHours: '',
	timezoneCoverage: '',

	about: '',
}