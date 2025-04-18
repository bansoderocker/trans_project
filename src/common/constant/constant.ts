import { auth } from "@/config/firebase";

export const getUserData = () => {
  return auth.currentUser;
};

// const masterTypes = [
//   { value: "party", label: "Party" },
//   { value: "truck", label: "Truck" },
//   { value: "location", label: "Location" },
//   { value: "expenseType", label: "Expense Type" },
// ];
