// src/hooks/useFormDirty.ts
import { useState, useCallback } from "react";

export function useFormDirty<T>(initialData: T) {
  const [data, setData]     = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving]   = useState(false);

  const handleChange = useCallback((updated: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updated }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(
    async (saveFn: (data: T) => void | Promise<void>) => {
      setSaving(true);
      await saveFn(data);
      setSaving(false);
      setIsDirty(false);
    },
    [data]
  );

  return { data, isDirty, saving, handleChange, handleSave };
}
