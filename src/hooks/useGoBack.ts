// src/hooks/useGoBack.ts
//
// Back arrows and "home" links that stay inside the user's own flow.
//
// `navigate(-1)` goes to whatever the browser had before, which is nothing useful when the page was opened in a new tab or
// after a refresh, and can be the public landing page or the login screen. A hard-coded `navigate('/')` is worse: `/` is
// the public / patient landing page, not a doctor's dashboard. These helpers fix both:
//   - useGoBack()   steps back when this app has an earlier page, otherwise goes to the user's home;
//   - useHomePath() is the portal (the dashboard for every signed-in persona) or the public landing page when signed out.
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ROUTES } from '../constants/routes'

/** The user's home: the portal when signed in (patient, doctor, pharmacy, radiology), the landing page when not. */
export function useHomePath(): string {
	const { accessToken } = useAuth()
	return accessToken ? ROUTES.PORTAL.HOME : ROUTES.ROOT
}

/** A function for back arrows: one page back inside the app, or `fallback` (default: the user's home) when there is none. */
export function useGoBack(fallback?: string): () => void {
	const navigate = useNavigate()
	const home = useHomePath()

	return useCallback(() => {
		// React Router stores the position in this tab's history as `history.state.idx`; 0 = no earlier page of ours.
		const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
		if (idx > 0) {
			navigate(-1)
			return
		}
		navigate(fallback ?? home, { replace: true })
	}, [navigate, home, fallback])
}
