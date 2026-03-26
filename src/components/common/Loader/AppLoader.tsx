// src/components/common/Loader/AppLoader.tsx
import { Box, CircularProgress, Typography } from "@mui/material";

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

export default function AppLoader({ message = "Loading...", fullScreen = false, size = 40 }: AppLoaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        ...(fullScreen
          ? { position: "fixed", inset: 0, bgcolor: "rgba(244,246,249,0.85)", zIndex: 9999, backdropFilter: "blur(4px)" }
          : { py: 6 }),
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress size={size} thickness={3} sx={{ color: "primary.light" }} />
        <CircularProgress
          size={size}
          thickness={3}
          variant="determinate"
          value={25}
          sx={{ color: "primary.main", position: "absolute", top: 0, left: 0, opacity: 0.3 }}
        />
      </Box>
      {message && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, letterSpacing: "0.04em" }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
