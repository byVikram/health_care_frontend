import React, { forwardRef } from 'react'
import { Switch, SwitchProps, SxProps, Theme } from '@mui/material'

export interface AppSwitchProps extends SwitchProps {
	sx?: SxProps<Theme>
}

const defaultSwitchSx = {
	width: 34,
	height: 18,
	padding: 0,

	'& .MuiSwitch-switchBase': {
		padding: 0,
		margin: '2px',
		transitionDuration: '300ms',

		'&.Mui-checked': {
			transform: 'translateX(16px)',
			color: '#fff',

			'& + .MuiSwitch-track': {
				backgroundColor: '#2B6F71',
				opacity: 1,
				border: 0,
			},
		},
	},

	'& .MuiSwitch-thumb': {
		boxSizing: 'border-box',
		width: 14,
		height: 14,
		boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
	},

	'& .MuiSwitch-track': {
		borderRadius: 2,
		backgroundColor: '#E2E8F0',
		opacity: 1,
		transition: 'background-color 300ms',
	},
}

const AppSwitch = forwardRef<HTMLButtonElement, AppSwitchProps>((props, ref) => {
	const { sx = {}, ...rest } = props

	return (
		<Switch
			ref={ref}
			sx={{
				...defaultSwitchSx,
				...sx,
			}}
			{...rest}
		/>
	)
})

AppSwitch.displayName = 'AppSwitch'

export default AppSwitch
