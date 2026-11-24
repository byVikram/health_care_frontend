import { useCallback, useRef, useState, type ReactNode } from 'react'
import AuthModal from './AuthModal'

/** `prompt(after)` opens the login pop-up; `after` runs once the visitor has signed in. Render `modal` somewhere in the page. */
export function useLoginPrompt(loginTitle?: string): { prompt: (after?: () => void) => void; modal: ReactNode } {
	const [open, setOpen] = useState(false)
	const afterRef = useRef<(() => void) | undefined>(undefined)

	const prompt = useCallback((after?: () => void) => {
		afterRef.current = after
		setOpen(true)
	}, [])

	const modal = (
		<AuthModal
			open={open}
			loginTitle={loginTitle}
			onClose={() => setOpen(false)}
			onVerified={() => {
				setOpen(false)
				const after = afterRef.current
				afterRef.current = undefined
				after?.()
			}}
		/>
	)
	return { prompt, modal }
}
