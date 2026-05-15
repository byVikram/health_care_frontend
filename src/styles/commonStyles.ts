// src/styles/commonStyles.ts

export const customCardStyle = {
	bgcolor: 'background.paper',
	border: '1px solid',
	borderColor: 'divider',
	borderRadius: '8px',
	p: 3,
}

export const customScrollbar = {
    '&::-webkit-scrollbar': {
        width: '4px',
        height: '4px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c7c6c6ff',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#555',
    },
};