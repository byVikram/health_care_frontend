---
description: Wire a new backend API endpoint into the web app via the ApiService/axios layer
---

# API Integration

Integrates a new backend endpoint into the web app following the standardized axios architecture (mirrors the equivalent skill in `gemini-mobile-app/`).

## Steps

1. **Constants** — add the endpoint path to `src/constants/apiUrls.ts` under the appropriate domain block. Never hardcode a URL string in a component/service.
2. **Types** — define request/response interfaces in `src/types/` (one file per domain entity already exists for most domains — extend it rather than duplicating).
3. **Service** — locate or create the domain service in `src/services/<domain>Service.ts` (or, for a feature with its own local service, `src/features/<feature>/<feature>Service.ts`).
4. **Implementation** — call through the shared `ApiService` wrapper (`src/services/apiService.ts`), not raw axios. `ApiService` already attaches the bearer token, handles 401 (logout + redirect), and shows a global error toast on failure — don't duplicate that.
5. **Opt-out** — if a non-2xx response is an expected state (e.g. a 404 meaning "not found yet") rather than a real error, pass `{ suppressErrorToast: true }` in the request config instead of wrapping in a try/catch just to swallow the toast.

## Template — `src/services/<domain>Service.ts`

```typescript
import ApiService from './apiService'
import { API_ENDPOINTS } from '../constants/apiUrls'

export interface MyFeatureResponse {
	success: boolean
	message: string
	data: unknown
}

export const myFeatureAction = async (payload: unknown): Promise<MyFeatureResponse> => {
	const res = await ApiService.post<MyFeatureResponse>(API_ENDPOINTS.DOMAIN.ACTION, payload)
	return res.data
}
```
