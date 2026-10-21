---
description: Standardize success/error UI feedback after an async action (form submit, booking, etc.)
---

# Handle Success/Error UI Feedback

Standardizes how user feedback is shown after async actions (mirrors the equivalent skill in `gemini-mobile-app/`, adapted to this app's toast-based pattern instead of a modal).

## Steps

1. **Don't duplicate global error handling** — `ApiService`'s response interceptor already shows a `react-toastify` error toast on any failed request (unless the call passed `{ suppressErrorToast: true }`) and already redirects to `/login` on 401. Only add local error handling for cases needing extra behavior (e.g. inline field errors, a custom message).
2. **Loading state** — track `isSubmitting`/`isLoading` via `useState`, or via Formik's built-in `isSubmitting` if the action is a form submission.
3. **Success feedback** — call `toast.success('...')` from `react-toastify` after a successful action; don't invent a separate success modal unless the page already uses one.
4. **Suppressing the global toast** — pass `{ suppressErrorToast: true }` in the request config when a non-2xx response is an expected state you're handling inline (e.g. "email already exists" shown as a field error, not a toast).

## Template

```tsx
import { useState } from 'react'
import { toast } from 'react-toastify'
import ApiService from '../../services/apiService'

export default function MyComponent() {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAction = async () => {
		try {
			setIsSubmitting(true)
			await ApiService.post('/some/endpoint', {})
			toast.success('Action completed successfully.')
		} catch {
			// Global error toast already shown by ApiService's interceptor.
		} finally {
			setIsSubmitting(false)
		}
	}

	return null // render your actual UI, disabling submit while isSubmitting
}
```
