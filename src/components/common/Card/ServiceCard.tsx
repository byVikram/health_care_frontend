import React from 'react'
import { Card, CardMedia, CardContent, Typography } from '@mui/material'

type ServiceCardProps = {
	image: string
	title: string
	description: string
	bgColor: string
	onClick?: () => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({ image, title, description, bgColor = '#919191', onClick }) => {
	return (
		<Card
			onClick={onClick}
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '12px',
				overflow: 'hidden',
				boxShadow: '0px 0px 9.65px 0px #00000029',
				cursor: onClick ? 'pointer' : 'default',
			}}
		>
			<CardMedia
				component="img"
				image={image}
				alt={title}
				sx={{
					height: 260,
					objectFit: 'cover',
					bgcolor: bgColor,
				}}
			/>

			<CardContent sx={{ flexGrow: 1 }}>
				<Typography variant="h5" gutterBottom>
					{title}
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
					{description}
				</Typography>
			</CardContent>
		</Card>
	)
}

export default ServiceCard
