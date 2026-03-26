// src/components/layout/MainLayout.tsx
import { Box } from '@mui/material'
import { ReactNode } from 'react'
import AppNavBar from '../common/Navbar/AppNavBar'
import AppFooter from './AppFooter'

interface MainLayoutProps {
	children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				bgcolor: 'background.default',
			}}
		>
			<AppNavBar />
			<Box sx={{ flex: 1, width: '100%' }}>{children}</Box>
			<AppFooter />
		</Box>
	)
}
