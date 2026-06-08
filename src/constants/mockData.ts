// src/constants/mockData.ts
import { Doctor } from '../types/doctor'

export const MOCK_DOCTOR: Doctor = {
	id: '143245',
	name: 'Dr. Ashika Rao',
	specialization: 'Dentist Consultation',
	avatar: 'https://i.pravatar.cc/150?img=47',
	clinicName: 'Arogya Clinic, KR Market',
	distance: '1km',
	secondaryLocation: 'Dhanvantri Clinic, marathalli',
	secondaryDistance: '5km',
	stats: { patients: 7500, experience: 10, ratings: 4.9, reviews: 4988 },
	recommendedPercentage: '96%',
	about: 'Dr. Ashika Rao is a highly experienced dentist and surgeon with over 10 years of expertise in treating tooth and gum related issues. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	workingTime: 'Mon-Fri, 09:00 AM - 10:30PM',
	hospitals: [
		{ id: 1, name: 'Arogya Clinic', address: '1st food near, Vittiya complex Khatabol', distance: '+1km' },
		{ id: 2, name: 'Dhanvantri Clinic', address: '1st food near, Vittiya complex-khatabol', distance: '<5km' },
	],
	appointmentTypes: [
		{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 300, duration: 30 },
		{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 300, duration: 30 },
	],
}

export const MOCK_DOCTORS: Doctor[] = [
	{
		id: '143245',
		name: 'Dr. Ashika Rao',
		specialization: 'Dentistry',
		avatar: 'https://i.pravatar.cc/150?img=47',
		clinicName: 'Arogya Clinic',
		distance: '1km',
		secondaryLocation: 'Dhanvantri Clinic, marathalli',
		secondaryDistance: '5km',
		stats: { patients: 7500, experience: 10, ratings: 4.9, reviews: 4988 },
		recommendedPercentage: '96%',
		about: 'Dr. Ashika Rao is a highly experienced dentist and surgeon with over 10 years of expertise.',
		workingTime: 'Mon-Fri, 09:00 AM - 10:30PM',
		hospitals: [{ id: 1, name: 'Arogya Clinic', address: 'Vittiya complex, KR Market', distance: '+1km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 300, duration: 30 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 300, duration: 30 },
		],
	},
	{
		id: '143246',
		name: 'Dr. Rajesh Kumar',
		specialization: 'Cardiology',
		avatar: 'https://i.pravatar.cc/150?img=12',
		clinicName: 'Heart Care Clinic',
		distance: '2km',
		secondaryLocation: 'Apollo Hospital, Bannerghatta',
		secondaryDistance: '8km',
		stats: { patients: 12000, experience: 15, ratings: 4.8, reviews: 6200 },
		recommendedPercentage: '90%',
		about: 'Dr. Rajesh Kumar is a renowned cardiologist with 15 years of experience in cardiac care.',
		workingTime: 'Mon-Sat, 10:00 AM - 08:00PM',
		hospitals: [{ id: 1, name: 'Heart Care Clinic', address: 'MG Road, Bengaluru', distance: '+2km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 500, duration: 30 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 400, duration: 30 },
		],
	},
	{
		id: '143247',
		name: 'Dr. Priya Sharma',
		specialization: 'Orthopedic',
		avatar: 'https://i.pravatar.cc/150?img=23',
		clinicName: 'Bone & Joint Clinic',
		distance: '3km',
		secondaryLocation: 'Manipal Hospital, Whitefield',
		secondaryDistance: '10km',
		stats: { patients: 9500, experience: 12, ratings: 4.7, reviews: 3800 },
		recommendedPercentage: '92%',
		about: 'Dr. Priya Sharma specializes in orthopedic surgery and joint replacement procedures.',
		workingTime: 'Tue-Sun, 09:00 AM - 07:00PM',
		hospitals: [{ id: 1, name: 'Bone & Joint Clinic', address: 'Indiranagar, Bengaluru', distance: '+3km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 600, duration: 45 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 450, duration: 30 },
		],
	},
	{
		id: '143248',
		name: 'Dr. Anil Verma',
		specialization: 'Neurology',
		avatar: 'https://i.pravatar.cc/150?img=57',
		clinicName: 'NeuroLife Clinic',
		distance: '4km',
		secondaryLocation: 'Fortis Hospital, Cunningham Rd',
		secondaryDistance: '6km',
		stats: { patients: 8200, experience: 18, ratings: 4.9, reviews: 5100 },
		recommendedPercentage: '97%',
		about: 'Dr. Anil Verma is a leading neurologist with expertise in stroke and epilepsy management.',
		workingTime: 'Mon-Fri, 11:00 AM - 09:00PM',
		hospitals: [{ id: 1, name: 'NeuroLife Clinic', address: 'Koramangala, Bengaluru', distance: '+4km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 700, duration: 45 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 550, duration: 30 },
		],
	},
	{
		id: '143249',
		name: 'Dr. Meena Nair',
		specialization: 'Kidney',
		avatar: 'https://i.pravatar.cc/150?img=44',
		clinicName: 'Renal Care Center',
		distance: '2km',
		secondaryLocation: 'Columbia Asia, Hebbal',
		secondaryDistance: '7km',
		stats: { patients: 6800, experience: 9, ratings: 4.6, reviews: 2900 },
		recommendedPercentage: '99%',
		about: 'Dr. Meena Nair is a nephrologist specializing in chronic kidney disease and dialysis.',
		workingTime: 'Mon-Sat, 08:00 AM - 06:00PM',
		hospitals: [{ id: 1, name: 'Renal Care Center', address: 'Jayanagar, Bengaluru', distance: '+2km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 550, duration: 30 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 400, duration: 30 },
		],
	},
	{
		id: '143250',
		name: 'Dr. Suresh Patel',
		specialization: 'Dentistry',
		avatar: 'https://i.pravatar.cc/150?img=68',
		clinicName: 'Smile Dental Clinic',
		distance: '1.5km',
		secondaryLocation: 'Whitesmile Dental, HSR Layout',
		secondaryDistance: '4km',
		stats: { patients: 5400, experience: 8, ratings: 4.5, reviews: 2100 },
		recommendedPercentage: '80%',
		about: 'Dr. Suresh Patel is a cosmetic dentist with expertise in smile designing and implants.',
		workingTime: 'Mon-Sat, 10:00 AM - 08:00PM',
		hospitals: [{ id: 1, name: 'Smile Dental Clinic', address: 'BTM Layout, Bengaluru', distance: '+1.5km' }],
		appointmentTypes: [
			{ id: 'clinic', label: 'Clinic Visit', description: 'In person consultation', price: 350, duration: 30 },
			{ id: 'video', label: 'Video Call', description: 'Virtual Consultation', price: 250, duration: 30 },
		],
	},
]

export const SPECIALITIES = [
	{ id: 'dentistry', label: 'Dentistry', iconKey: 'dentistry' },
	{ id: 'cardiology', label: 'Cardiology', iconKey: 'cardiology' },
	{ id: 'orthopedic', label: 'Orthopedic', iconKey: 'orthopedic' },
	{ id: 'neurology', label: 'Neurology', iconKey: 'neurology' },
	{ id: 'kidney', label: 'Kidney', iconKey: 'kidney' },
	{ id: 'skin', label: 'Skin', iconKey: 'skin' },
]


// ─── Patient Health Questions ─────────────────────────────────────────────────

export interface DoctorAnswer {
	id: number
	doctorName: string
	specialty: string
	hospital: string
	avatar: string
	timeAgo: string
	answer: string
	likes: number
}

export interface PatientQuestion {
	id: number
	gender: string
	age: string
	location: string
	timeAgo: string
	tag: string
	question: string
	patientAvatar: string
	shortDescription: string
	fullDescription: string
	patientLabel: string
	patientLocation: string
	history: string
	answers: DoctorAnswer[]
}

export const MOCK_PATIENT_QUESTIONS: PatientQuestion[] = [
	{
		id: 1,
		gender: 'Female',
		age: '30 Years',
		location: 'Bengaluru',
		timeAgo: '1D AGO',
		tag: 'Oncology Inquiry',
		patientAvatar: 'https://i.pravatar.cc/40?img=47',
		question: 'Chance of esophageal cancer?',
		shortDescription:
			"I've been having persistent acid reflux and difficulty swallowing for about 3 weeks now. My grandfather had esophageal cancer and I'm very concerned...",
		fullDescription:
			"I've been having persistent acid reflux and difficulty swallowing for about 3 weeks now. My grandfather had esophageal cancer and I'm very concerned about my risk factors. I don't smoke, but I do have a history of GERD. The swallowing issue feels like food is getting stuck in the lower part of my throat. I haven't noticed any significant weight loss yet. What are the next steps for diagnosis?",
		patientLabel: '30 Year Old Female',
		patientLocation: 'Bengaluru, India',
		history: 'Family Hx, GERD',
		answers: [
			{
				id: 1,
				doctorName: 'Dr. Sarah Chen',
				specialty: 'Gastroenterologist',
				hospital: 'Apollo Hospitals',
				avatar: 'https://i.pravatar.cc/40?img=12',
				timeAgo: '4h ago',
				answer:
					"While persistent dysphagia (difficulty swallowing) combined with a family history is something to take seriously, at age 30, the probability remains low. However, given the GERD history, you should schedule an Endoscopy (EGD) to rule out Barrett's Esophagus or strictures.",
				likes: 12,
			},
			{
				id: 2,
				doctorName: 'Dr. James Wilson',
				specialty: 'Oncologist',
				hospital: 'Memorial Care',
				avatar: 'https://i.pravatar.cc/40?img=52',
				timeAgo: '8h ago',
				answer:
					'I agree with Dr. Chen. The absence of weight loss is a positive sign. You may also want to monitor for any nocturnal cough or hoarseness. Start with a consultation with a GI specialist immediately to manage the reflux more aggressively.',
				likes: 8,
			},
		],
	},
	{
		id: 2,
		gender: 'Male',
		age: '45 Years',
		location: 'Mumbai',
		timeAgo: '2D AGO',
		tag: 'Respiratory',
		patientAvatar: 'https://i.pravatar.cc/40?img=11',
		question: 'Persistent cough after viral infection',
		shortDescription:
			"It's been over 4 weeks since my cold ended but I still have a dry hacking cough especially at night...",
		fullDescription:
			"It's been over 4 weeks since my cold ended but I still have a dry hacking cough especially at night. I am a non-smoker and have no fever. The cough is non-productive. Could this be post-viral cough or something more serious like whooping cough or asthma?",
		patientLabel: '45 Year Old Male',
		patientLocation: 'Mumbai, India',
		history: 'None reported',
		answers: [
			{
				id: 1,
				doctorName: 'Dr. Priya Nair',
				specialty: 'Pulmonologist',
				hospital: 'Fortis Hospital',
				avatar: 'https://i.pravatar.cc/40?img=44',
				timeAgo: '1d ago',
				answer:
					'Post-viral cough is very common and can persist for 6-8 weeks after a respiratory infection. It is likely caused by post-nasal drip or airway hyper-reactivity. A short course of antihistamines and avoiding cold air may help. If it persists beyond 8 weeks, a chest X-ray and spirometry would be warranted.',
				likes: 15,
			},
		],
	},
	{
		id: 3,
		gender: 'Female',
		age: '52 Years',
		location: 'Bengaluru',
		timeAgo: '3D AGO',
		tag: 'Endocrinology',
		patientAvatar: 'https://i.pravatar.cc/40?img=49',
		question: 'Managing Type 2 Diabetes during travel',
		shortDescription:
			'I am planning a 12-hour international flight. How should I adjust my insulin timing with the time zone...',
		fullDescription:
			'I am planning a 12-hour international flight from India to the USA with a time zone difference of +10 hours. I am on basal-bolus insulin therapy. How should I adjust my insulin timing with the time zone change? I am worried about hypoglycemia during the flight.',
		patientLabel: '52 Year Old Female',
		patientLocation: 'Bengaluru, India',
		history: 'Type 2 Diabetes, Hypertension',
		answers: [
			{
				id: 1,
				doctorName: 'Dr. Anil Kumar',
				specialty: 'Endocrinologist',
				hospital: 'Manipal Hospitals',
				avatar: 'https://i.pravatar.cc/40?img=60',
				timeAgo: '2d ago',
				answer:
					'For long eastward flights, you generally need less basal insulin. Keep fast-acting glucose snacks handy. Check glucose every 3-4 hours during the flight. Consult your diabetologist before travel so we can give you a personalized insulin adjustment plan based on your current regimen.',
				likes: 20,
			},
		],
	},
	{
		id: 4,
		gender: 'Female',
		age: '5 Years',
		location: 'Delhi',
		timeAgo: '5D AGO',
		tag: 'Dermatology',
		patientAvatar: 'https://i.pravatar.cc/40?img=48',
		question: "Rash on child's arm",
		shortDescription:
			"My 5-year-old has developed a bumpy red rash on her inner elbow. It's very itchy. Could this be eczema...",
		fullDescription:
			"My 5-year-old has developed a bumpy red rash on her inner elbow. It's very itchy. She does not have a fever. We recently switched laundry detergent. Could this be eczema or contact dermatitis? Should I apply a steroid cream?",
		patientLabel: '5 Year Old Female',
		patientLocation: 'Delhi, India',
		history: 'No known allergies',
		answers: [
			{
				id: 1,
				doctorName: 'Dr. Meena Sharma',
				specialty: 'Dermatologist',
				hospital: 'AIIMS Delhi',
				avatar: 'https://i.pravatar.cc/40?img=35',
				timeAgo: '4d ago',
				answer:
					'The presentation sounds like contact dermatitis triggered by the new detergent. Switch back to the old detergent immediately and wash all clothing again. A mild hydrocortisone 0.5% cream can be applied twice daily for a few days. Do not use stronger steroids without a prescription for a child this young.',
				likes: 18,
			},
		],
	},
	{
		id: 5,
		gender: 'Male',
		age: '38 Years',
		location: 'Chennai',
		timeAgo: '6D AGO',
		tag: 'Cardiology',
		patientAvatar: 'https://i.pravatar.cc/40?img=15',
		question: 'Chest pain after mild exercise',
		shortDescription:
			'I have been experiencing mild chest tightness after climbing stairs or walking briskly for about 2 weeks...',
		fullDescription:
			'I have been experiencing mild chest tightness after climbing stairs or walking briskly for about 2 weeks now. The discomfort lasts about 2-3 minutes and goes away with rest. I am 38 years old, slightly overweight, and my father had a heart attack at 55. I do not smoke but I do drink occasionally. Should I be worried about angina or something more serious?',
		patientLabel: '38 Year Old Male',
		patientLocation: 'Chennai, India',
		history: 'Family Hx, Overweight',
		answers: [
			{
				id: 1,
				doctorName: 'Dr. Ramesh Iyer',
				specialty: 'Cardiologist',
				hospital: 'Fortis Malar',
				avatar: 'https://i.pravatar.cc/40?img=33',
				timeAgo: '5d ago',
				answer:
					'The symptoms you describe are classic for stable angina and must not be ignored given your family history. Please get an ECG, stress test, and lipid profile done immediately. Avoid strenuous activity until evaluated. With early intervention, this is very manageable.',
				likes: 22,
			},
			{
				id: 2,
				doctorName: 'Dr. Anitha Rao',
				specialty: 'General Physician',
				hospital: 'Apollo Chennai',
				avatar: 'https://i.pravatar.cc/40?img=41',
				timeAgo: '5d ago',
				answer:
					'I agree this needs urgent evaluation. In the meantime, avoid alcohol entirely and keep a diary of when episodes occur. Your BMI and family history both elevate your risk. Do not delay the cardiology referral.',
				likes: 10,
			},
		],
	},
]