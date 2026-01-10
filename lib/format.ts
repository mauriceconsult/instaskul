export const formatAmount = (
  amount: string | number | null | undefined,
  currency: string = "UGX",
  locale: string = "en-UG"
): string => {
  if (amount == null || amount === "") {
    return "—";
  }

  const num = Number(amount);
  if (Number.isNaN(num)) {
    return "Invalid amount";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};