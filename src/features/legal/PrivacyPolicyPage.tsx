// src/features/legal/PrivacyPolicyPage.tsx
import { ROUTES } from '../../constants/routes'
import LegalAccordionPage, { type LegalSection } from './LegalAccordionPage'

const SECTIONS: LegalSection[] = [
	{ title: 'What we collect', summary: 'Your name, mobile, email, addresses, family members, and booking history.' },
	{ title: 'Health information', summary: 'Prescriptions, reports and visit notes you or your providers add. Treated as sensitive data.' },
	{ title: 'How we use it', summary: 'To run bookings, send updates and codes, process payments, and improve the service.' },
	{ title: 'Who we share it with', summary: 'Only the doctor, lab or provider you book, payment partners, and when the law requires it. We don’t sell your data.' },
	{ title: 'Location', summary: 'Used to find nearby care and to guide a provider to your address during a visit.' },
	{ title: 'Cookies on the website', summary: 'Essential cookies keep you signed in; optional analytics cookies only with your consent.' },
	{ title: 'How long we keep it', summary: 'How long records are kept and how to ask for deletion.' },
	{ title: 'Security', summary: 'How your data is protected in storage and in transit.' },
	{ title: 'Your choices and rights', summary: 'See, correct, download or delete your data, and manage notifications and consent.' },
	{ title: 'Grievance officer', summary: 'Who to contact about privacy concerns, and how quickly we respond.' },
]

export default function PrivacyPolicyPage() {
	return (
		<LegalAccordionPage
			title="Privacy policy"
			sections={SECTIONS}
			related={{ label: 'Terms of use', to: ROUTES.PUBLIC.TERMS }}
		/>
	)
}
