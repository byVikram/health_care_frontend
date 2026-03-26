// src/hooks/useProfileForm.ts
import { useState, useCallback } from "react";

export function useProfileForm<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [savedData, setSavedData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = useCallback((updated: Partial<T>) => {
    setData((prev) => {
      const next = { ...prev, ...updated };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(savedData));
      return next;
    });
  }, [savedData]);

  const handleSave = useCallback(() => {
    setSavedData(data);
    setIsDirty(false);
    setShowSuccess(true);
  }, [data]);

  const handleCloseSnackbar = useCallback(() => setShowSuccess(false), []);

  return { data, isDirty, showSuccess, handleChange, handleSave, handleCloseSnackbar };
}
