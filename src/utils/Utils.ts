export const formatINR = (amount: number | string): string => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(value)) return "\u20B90.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};

/**
 * Safely formats a doctor's name with a single "Dr." prefix.
 * Works whether the API returns "Anjali Singh" OR "Dr. Anjali Singh" —
 * the output is always "Dr. Anjali Singh" (never "Dr. Dr. Anjali Singh").
 */
export const formatDoctorName = (name?: string | null): string => {
  if (!name) return '';
  // Strip any existing "Dr." prefixes (case-insensitive, with optional space)
  const stripped = name.replace(/^(Dr\.?\s*)+/i, '').trim();
  if (!stripped) return 'Dr.';
  return `Dr. ${stripped}`;
};

/**
 * Fixes notification/message strings that contain "Dr. Dr." due to the
 * backend already including the prefix in the name field.
 * Replaces every occurrence of "Dr. Dr." with "Dr." in a string.
 */
export const fixDoubleDr = (text?: string | null): string => {
  if (!text) return '';
  return text.replace(/\bDr\.\s+(?:Dr\.\s*)+/gi, 'Dr. ');
};
