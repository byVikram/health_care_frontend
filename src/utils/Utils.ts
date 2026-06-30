export const formatINR = (amount: number | string): string => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(value)) return "\u20B90.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};