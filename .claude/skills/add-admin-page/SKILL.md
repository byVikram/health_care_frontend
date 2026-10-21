---
description: Scaffold a new admin list/create/edit page set, following the existing ~24-page admin section pattern
---

# Add an Admin Page

The admin section (`src/features/admin/pages/`) already has ~20 pages (users, appointments, audits, blogs, articles, comments, reviews, ads, communities, events, QA, specialities, verifications). New entities follow the same list + create + edit shape seen in `AdminBlogsPage.tsx` / `AdminBlogCreatePage.tsx` / `AdminBlogEditPage.tsx`.

## Steps

1. **Service** — add list/get/create/update/delete functions to `src/features/admin/adminService.ts` (or the relevant domain service), calling through `ApiService` per the `api-integration` skill. Export a typed item interface (e.g. `AdminBlogItem`).
2. **List page** — `src/features/admin/pages/Admin<Entity>Page.tsx`:
   - `useState` for the list + `loading`, fetch in a `useEffect` on mount.
   - Render via `AppTable` (`src/components/common/Table/AppTable.tsx`) with typed `Column[]`.
   - Header via `AdminPageHeader` (`title`, optional `count`, `actions` for a "Create" button).
   - Row status via `StatusBadge` (`src/components/admin/StatusBadge.tsx`) where applicable.
   - Row actions (edit/delete) navigate via `ROUTES.ADMIN.<ENTITY>_EDIT`/`_CREATE`, replacing `:id` manually (`route.replace(':id', item.id)`) since there's no route-builder helper.
3. **Create/Edit pages** — `Admin<Entity>CreatePage.tsx` / `Admin<Entity>EditPage.tsx`, reusing a shared form component (see `ArticleForm.tsx` for a create/edit-shared form example) where the entity has enough fields to warrant it; otherwise a single page with plain `useState` per the `add-form` skill.
4. **Routes** — add `LIST`/`_CREATE`/`_EDIT` (or similar) path constants under `ROUTES.ADMIN` in `src/constants/routes.ts`.
5. **Register** — import the three page components and add their `<Route>`s inside the existing admin route block in `src/routes/AppRoutes.tsx` (already wrapped in `AdminProtectedRoute` + `AdminLayout` — don't re-wrap).
6. **Empty state** — use `AdminEmptyState` (`src/components/admin/AdminEmptyState.tsx`) for the "no items yet" case instead of a bespoke empty message.

## Template — list page skeleton

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTable, { Column } from '../../../components/common/Table/AppTable'
import AdminPageHeader from '../../../components/admin/AdminPageHeader'
import { listAdminEntities, AdminEntityItem } from '../adminService'
import { ROUTES } from '../../../constants/routes'
import { toast } from 'react-toastify'

export default function AdminEntityPage() {
	const navigate = useNavigate()
	const [items, setItems] = useState<AdminEntityItem[]>([])
	const [loading, setLoading] = useState(true)

	const fetchItems = async () => {
		setLoading(true)
		try {
			const res = await listAdminEntities()
			setItems(res.data)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchItems()
	}, [])

	return (
		<>
			<AdminPageHeader title="Entities" count={items.length} />
			{/* AppTable with columns + row actions */}
		</>
	)
}
```
