export const getInitials = (fullName: string): string => {
  return fullName
    .split(" ") // Split by spaces
    .filter(Boolean) // Remove empty strings
    .map((word) => word[0].toUpperCase()) // Take first letter & capitalize
    .join("");
};
