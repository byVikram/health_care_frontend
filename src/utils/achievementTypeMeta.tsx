// src/utils/achievementTypeMeta.tsx
// Self-contained icon/color mapping for achievement types, used by the
// patient-facing Achievements carousel + details modal. Kept independent
// from the doctor-profile management tab's own CATEGORIES map so neither
// screen risks regressing the other.
import { ReactNode } from 'react'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined'

export interface AchievementTypeMeta {
	icon: ReactNode
	color: string
}

const ACHIEVEMENT_TYPE_META: Record<string, AchievementTypeMeta> = {
	Award: { icon: <EmojiEventsOutlinedIcon />, color: '#2B6F71' },
	Research: { icon: <ScienceOutlinedIcon />, color: '#E4572E' },
	Publication: { icon: <ArticleOutlinedIcon />, color: '#7C3AED' },
	Conference: { icon: <GroupsOutlinedIcon />, color: '#0EA5E9' },
	Certification: { icon: <WorkspacePremiumOutlinedIcon />, color: '#2563EB' },
	Recognition: { icon: <MilitaryTechOutlinedIcon />, color: '#D97706' },
}

const DEFAULT_META: AchievementTypeMeta = ACHIEVEMENT_TYPE_META.Award

export function getAchievementTypeMeta(type?: string | null): AchievementTypeMeta {
	if (!type) return DEFAULT_META
	return ACHIEVEMENT_TYPE_META[type] ?? DEFAULT_META
}
