// src/components/common/Card/AppCard.tsx
import { Box, Typography, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

interface AppCardProps {
  title?: string;
  value?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  accent?: string;
  sx?: SxProps<Theme>;
}

export default function AppCard({ title, value, subtitle, icon, accent, sx = {} }: AppCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "14px",
        p: 3,
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
        },
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: accent ? `${accent}18` : "primary.main",
            color: accent || "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 24,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, letterSpacing: "0.03em", textTransform: "uppercase", fontSize: "0.72rem" }}
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
