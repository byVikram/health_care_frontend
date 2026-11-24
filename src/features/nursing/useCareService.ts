// src/features/nursing/useCareService.ts
//
// Which home-care service the current page is about, read from the address: /nursing-care/... is nursing, /care/<service>/... is that service. The
// routes are checked by CareRoute before a page renders, so an unknown service never reaches a page (it falls back to nursing here only to stay typed).
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { careCopy, isCareServiceKey, type CareCopy, type CareServiceKey } from './careServices'

export function useCareService(): CareCopy {
	const { serviceKey } = useParams()
	const { pathname } = useLocation()
	const key: CareServiceKey = pathname.startsWith('/nursing-care') ? 'nursing-care' : isCareServiceKey(serviceKey) ? serviceKey : 'nursing-care'
	return useMemo(() => careCopy(key), [key])
}
