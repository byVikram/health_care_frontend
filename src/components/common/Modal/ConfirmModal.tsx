// src/components/common/Modal/ConfirmModal.tsx

import { Dialog, Box, Typography } from "@mui/material";
import {
	DeleteOutline,
	WarningAmberOutlined,
	CheckCircleOutline,
	InfoOutlined,
	HelpOutline,
} from "@mui/icons-material";
import { ReactNode } from "react";
import AppButton from "../Button/AppButton";

type ConfirmVariant = "delete" | "warning" | "success" | "info" | "confirm";

interface ConfirmModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm?: () => void;

	title?: string;
	description?: string;

	variant?: ConfirmVariant;

	confirmLabel?: string;
	cancelLabel?: string;

	loading?: boolean;

	/** optional overrides */
	icon?: ReactNode;
}

const VARIANT_CONFIG: Record<
	ConfirmVariant,
	{ icon: ReactNode; iconBg: string; confirmColor: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'inherit' }
> = {
	delete: {
		icon: <DeleteOutline fontSize="inherit" />,
		iconBg: "#ef5350",
		confirmColor: "error",
	},
	warning: {
		icon: <WarningAmberOutlined fontSize="inherit" />,
		iconBg: "#f57c00",
		confirmColor: "warning",
	},
	success: {
		icon: <CheckCircleOutline fontSize="inherit" />,
		iconBg: "#2e7d32",
		confirmColor: "success",
	},
	info: {
		icon: <InfoOutlined fontSize="inherit" />,
		iconBg: "#0288d1",
		confirmColor: "info",
	},
	confirm: {
		icon: <HelpOutline fontSize="inherit" />,
		iconBg: "#546e7a",
		confirmColor: "primary",
	},
};

export default function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	variant = "confirm",
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	loading = false,
	icon,
}: ConfirmModalProps) {
	const config = VARIANT_CONFIG[variant];

	const finalIcon = icon ?? config.icon;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: "20px",
					boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
					overflow: "hidden",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					px: 4,
					pt: 4.5,
					pb: 4,
					gap: 2,
				}}
			>
				<Box
					sx={{
						width: 68,
						height: 68,
						borderRadius: "50%",
						bgcolor: config.iconBg,
						color: "#fff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 32,
						mb: 0.5,
						boxShadow: `0 8px 24px ${config.iconBg}55`,
					}}
				>
					{finalIcon}
				</Box>

				{title && (
					<Typography
						variant="h5"
						sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}
					>
						{title}
					</Typography>
				)}

				{description && (
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", lineHeight: 1.65, maxWidth: 300 }}
					>
						{description}
					</Typography>
				)}

				<Box sx={{ display: "flex", gap: 1.5, mt: 1, width: "100%" }}>
					<AppButton
						variant="outlined"
						label={cancelLabel}
						fullWidth
						onClick={onClose}
					/>

					<AppButton
						color={config.confirmColor}
						label={confirmLabel}
						fullWidth
						loading={loading}
						onClick={onConfirm}
					/>
				</Box>
			</Box>
		</Dialog>
	);
}