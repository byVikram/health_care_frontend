// src/components/common/Modal/AppModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode } from "react";

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export default function AppModal({ open, onClose, title, children, actions, maxWidth = "sm", fullWidth = true }: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{title}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
