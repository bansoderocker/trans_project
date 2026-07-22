import { ToWords } from "to-words";

export const convertAmountToWord = (amount: number): string => {
  const toWords = new ToWords();
  return toWords.convert(amount, { currency: true });
};

export const getInitials = (fullName: string): string => {
  return fullName
    .split(" ") // Split by spaces
    .filter(Boolean) // Remove empty strings
    .map((word) => word[0].toUpperCase()) // Take first letter & capitalize
    .join("");
};

export const capitalizeWords = (value?: string | null): string => {
  if (!value?.trim()) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const allcapitalizeWords = (value?: string | null): string => {
  if (!value?.trim()) return "";

  return value.toUpperCase();
};

export const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});
