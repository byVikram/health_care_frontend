// src/features/nursing/useNursingCatalogue.ts
//
// The catalogue of the browse page: procedures AND packages from one call (GET /catalog), searched on the server once the patient pauses typing,
// plus the "Care for" categories and the public config (visit policy, helpline). The latest search wins: an older answer that arrives late is dropped.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	DEFAULT_POLICY,
	fetchCatalogue,
	fetchCategories,
	fetchConfig,
	nursingErrorMessage,
	type NursingCatalogue,
	type NursingCategory,
	type NursingConfig,
} from './nursingService'

const EMPTY: NursingCatalogue = { procedures: [], packages: [] }

export function useNursingCatalogue(serviceKey: string, term: string) {
	const [data, setData] = useState<NursingCatalogue>(EMPTY)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const latest = useRef(0)

	const load = useCallback(async () => {
		const ticket = ++latest.current
		setLoading(true)
		setError(null)
		try {
			const result = await fetchCatalogue(serviceKey, term)
			if (ticket === latest.current) setData(result)
		} catch (e) {
			if (ticket === latest.current) {
				setData(EMPTY)
				setError(nursingErrorMessage(e, 'We could not load the services. Please try again.'))
			}
		} finally {
			if (ticket === latest.current) setLoading(false)
		}
	}, [serviceKey, term])

	useEffect(() => {
		void load()
	}, [load])

	return { ...data, loading, error, retry: load }
}

export function useNursingCategories(serviceKey: string) {
	const [categories, setCategories] = useState<NursingCategory[]>([])
	useEffect(() => {
		let alive = true
		void (async () => {
			const list = await fetchCategories(serviceKey)
			if (alive) setCategories(list)
		})()
		return () => {
			alive = false
		}
	}, [serviceKey])
	return categories
}

let configCache: NursingConfig | null = null

/** The visit policy (60 minutes to assign, 120 to cancel) and the helpline; the defaults are used until the server answers. */
export function useNursingConfig(): NursingConfig {
	const [config, setConfig] = useState<NursingConfig>(configCache ?? { policy: DEFAULT_POLICY, helpline: null })
	useEffect(() => {
		if (configCache) return
		let alive = true
		void (async () => {
			const result = await fetchConfig()
			configCache = result
			if (alive) setConfig(result)
		})()
		return () => {
			alive = false
		}
	}, [])
	return config
}
