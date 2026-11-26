// src/features/legal/TermsOfUsePage.tsx
import { ROUTES } from '../../constants/routes'
import LegalAccordionPage, { type LegalSection } from './LegalAccordionPage'

const SECTIONS: LegalSection[] = [
	{ title: 'About these terms', summary: 'Who we are, who these terms apply to, and that using Karolahealth means you accept them.' },
	{ title: 'Your account', summary: 'Signing up with a verified mobile number, keeping your details accurate, and booking for family members.' },
	{ title: 'Bookings and payments', summary: 'How doctor, lab and home-care bookings work, prices shown on the website and app, and payment methods.' },
	{ title: 'Cancellations and refunds', summary: 'Free-cancellation windows, instant-visit fees, and how and when refunds reach you.' },
	{ title: 'Not for emergencies', summary: 'Karolahealth is not an emergency service. In an emergency, call 112 or go to the nearest hospital.' },
	{ title: 'Doctors and care providers', summary: 'Providers are independent, verified professionals. What we check, and what they’re responsible for.' },
	{ title: 'Acceptable use', summary: 'What you must not do on Karolahealth, such as sharing false information or misusing the service.' },
	{ title: 'Liability', summary: 'The limits of our responsibility for advice, treatment and outcomes.' },
	{ title: 'Changes to these terms', summary: 'How we’ll tell you about changes and when they take effect.' },
	{ title: 'Contact us', summary: 'How to reach support and our registered address.' },
]

export default function TermsOfUsePage() {
	return (
		<LegalAccordionPage
			title="Terms of use"
			sections={SECTIONS}
			related={{ label: 'Privacy policy', to: ROUTES.PUBLIC.PRIVACY }}
			defaultOpen={[0]}
		/>
	)
}
