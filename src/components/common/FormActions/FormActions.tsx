// src/components/common/FormActions/FormActions.tsx
import { useState, useEffect } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AppButton from "../Button/AppButton";

interface FormActionsProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
}

export default function FormActions({ isDirty, saving, onSave }: FormActionsProps) {
  const [toast, setToast] = useState(false);

  // Show success toast when saving finishes (saving flips false after save)
  const [wasSaving, setWasSaving] = useState(false);
  useEffect(() => {
    if (wasSaving && !saving) setToast(true);
    setWasSaving(saving);
  }, [saving]);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <AppButton
          label="Save"
          startIcon={<SaveOutlinedIcon fontSize="small" />}
          disabled={!isDirty}
          loading={saving}
          onClick={onSave}
          size="medium"
          sx={{ minWidth: 120 }}
        />
      </Box>

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: "10px", fontSize: "13.5px" }}
        >
          Changes saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
