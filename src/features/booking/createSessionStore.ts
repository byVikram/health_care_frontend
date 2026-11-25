// src/features/booking/createSessionStore.ts
//
// The plumbing the Lab tests and the home-care booking stores share: a module-level store that is read and written in sessionStorage
// (a refresh keeps the booking in progress), told to React through useSyncExternalStore, and emptied when the user logs out.
// Every storage access is guarded: it can be missing or full, and then the booking is just not kept across a refresh.
import { useSyncExternalStore } from 'react'
import { registerSessionCache } from './sessionCache'

interface SessionStoreOptions<S> {
	/** The sessionStorage key (versioned: change it when the stored shape changes). */
	key: string
	initial: () => S
	/** Rebuilds the state from what was stored, or returns null when it is not valid (then the store starts empty). */
	restore: (raw: unknown) => S | null
	/** What to keep for this state, or null to keep nothing (an empty booking). */
	persist: (state: S) => unknown
}

export function createSessionStore<S>({ key, initial, restore, persist }: SessionStoreOptions<S>) {
	const read = (): S => {
		try {
			const raw = sessionStorage.getItem(key)
			if (!raw) return initial()
			return restore(JSON.parse(raw)) ?? initial()
		} catch {
			return initial()
		}
	}

	const write = (s: S) => {
		try {
			const kept = persist(s)
			if (kept == null) sessionStorage.removeItem(key)
			else sessionStorage.setItem(key, JSON.stringify(kept))
		} catch {
			// private mode / quota: the booking just is not kept across a refresh
		}
	}

	let state: S = read()
	const listeners = new Set<() => void>()

	const get = () => state
	const subscribe = (listener: () => void) => {
		listeners.add(listener)
		return () => {
			listeners.delete(listener)
		}
	}
	/** Replaces the state, keeps it in sessionStorage and tells the screens. */
	const replace = (next: S) => {
		state = next
		write(state)
		listeners.forEach((l) => l())
	}

	// the booking holds the patient's name, address and order: it is cleared on logout like the other per-user caches
	registerSessionCache(() => replace(initial()))

	return { get, replace, useStore: () => useSyncExternalStore(subscribe, get, get) }
}
