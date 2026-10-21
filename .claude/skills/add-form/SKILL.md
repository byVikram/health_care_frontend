---
description: Add an editable form section following this app's actual (non-Formik) state pattern
---

# Add a Form

⚠️ `formik` and `yup` are installed dependencies, but grep shows they're used in exactly one place (`src/features/auth/test/TestRegisterNew.tsx` — an experimental/test page). Every real form in the app (`PatientProfilePage`, `RegisterPage`, etc.) uses **plain `useState`**, not Formik. Follow that actual pattern, don't reach for Formik unless the user explicitly asks for it.

## Steps

1. **Data state** — `useState` for the current form values, seeded from the loaded entity (or an `EMPTY_*` constant while loading).
2. **Dirty tracking** — a separate `useState<Partial<T>>({})` object holding only the fields the user has changed since last save (see `PatientProfilePage.tsx`'s `dirtyPersonal`/`dirtyMedical`/`dirtyLifeStyle` pattern for a multi-section form). Merge dirty fields into the base state on change; only send the dirty subset to the API on save.
3. **Change handler** — `onChange={(updated) => { setData(prev => ({...prev, ...updated})); setDirty(prev => ({...prev, ...updated})) }}`.
4. **Save handler** — `async function handleSave() { await ApiService.patch(endpoint, dirtyFields); setDirty({}); toast.success('Saved') }` — wrap in `try/catch` only if you need custom error UI beyond the global toast (see the `ui-feedback` skill).
5. **Validation** — this app does inline/manual validation (simple truthy/format checks before submit), not a schema library. Keep validation logic next to the submit handler, not in a separate schema file, unless the page is already large enough to warrant one.
6. Only wrap in the actual `formik`/`yup` stack if the user explicitly asks for schema-based validation — don't introduce it as a silent "improvement".

## Template

```tsx
import { useState } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../../services/apiService'

interface MyFormData {
	name: string
	email: string
}

export default function MyForm({ initial, endpoint }: { initial: MyFormData; endpoint: string }) {
	const [data, setData] = useState<MyFormData>(initial)
	const [dirty, setDirty] = useState<Partial<MyFormData>>({})
	const [saving, setSaving] = useState(false)

	const handleChange = (updated: Partial<MyFormData>) => {
		setData((prev) => ({ ...prev, ...updated }))
		setDirty((prev) => ({ ...prev, ...updated }))
	}

	const handleSave = async () => {
		setSaving(true)
		try {
			await ApiService.patch(endpoint, dirty)
			setDirty({})
			toast.success('Saved successfully')
		} finally {
			setSaving(false)
		}
	}

	return null // render fields bound to `data`, calling handleChange on edit
}
```
