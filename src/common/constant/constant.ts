import { auth } from "@/config/firebase";

export const getUserData = () => {
  if (typeof window === "undefined") return null; // Server-side

  return auth.currentUser;
};

// const masterTypes = [
//   { value: "party", label: "Party" },
//   { value: "truck", label: "Truck" },
//   { value: "location", label: "Location" },
//   { value: "expenseType", label: "Expense Type" },
// ];

export const vTransApiEndPoint = {
  getBillList: "getBillList",
};
