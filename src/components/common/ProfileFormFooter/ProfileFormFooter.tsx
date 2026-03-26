// src/components/common/ProfileFormFooter/ProfileFormFooter.tsx
import { Box, Fade, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AppButton from "../Button/AppButton";

interface ProfileFormFooterProps {
  isDirty: boolean;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onDiscard?: () => void;
}

export default function ProfileFormFooter({ isDirty, saving, saved, onSave, onDiscard }: ProfileFormFooterProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 1.5,
        mt: 3,
        pt: 2.5,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Saved confirmation inline */}
      <Fade in={saved}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mr: "auto" }}>
          <CheckCircleIcon sx={{ fontSize: 17, color: "success.main" }} />
          <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "13px" }}>
            Changes saved successfully
          </Typography>
        </Box>
      </Fade>

      {/* Discard — only visible when dirty */}
      {isDirty && onDiscard && (
        <AppButton
          label="Discard"
          variant="outlined"
          color="inherit"
          size="small"
          onClick={onDiscard}
          sx={{ color: "text.secondary", borderColor: "divider" }}
        />
      )}

      {/* Save */}
      <AppButton
        label="Save changes"
        variant="contained"
        color="primary"
        size="small"
        disabled={!isDirty}
        loading={saving}
        onClick={onSave}
      />
    </Box>
  );
}
