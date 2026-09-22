---
description: Scaffold a new feature page/component and register it in the router
---

# Build a New Feature Page

Scaffolds and integrates a new page using the feature-sliced architecture (mirrors the equivalent skill in `gemini-mobile-app/`).

## Steps

1. **Folder** — create `src/features/<feature_name>/` if the domain doesn't already exist. Use lowercase for the folder name (existing feature folders are lowercase except `Pharmacy/` and `ChatBot/`, which are known inconsistencies — don't copy that pattern for new features).
2. **Component** — create the main page `<Name>Page.tsx` directly inside the feature folder. Use MUI components (`Box`, `Typography`, etc.) and the `sx` prop for styling, consistent with the rest of the app; pull shared style objects from `src/styles/commonStyles.ts` where applicable.
3. **Encapsulation** — break complex UI into smaller components inside `src/features/<feature>/components/`. Only put something in `src/components/common/` if it's genuinely reusable across features, and check with the user first.
4. **Routing** — add the path to the `ROUTES` object in `src/constants/routes.ts`.
5. **Router registration** — register the route in `src/routes/AppRoutes.tsx`, choosing `MainLayout` or `NavbarLayout` as appropriate, and wrap in `ProtectedRoute`/`AdminProtectedRoute` if the page requires auth.

## Template — `src/features/<feature>/<Name>Page.tsx`

```tsx
import { Box, Typography } from '@mui/material'

export default function NewFeaturePage() {
	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="h5">New Feature</Typography>
		</Box>
	)
}
```
