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

export const DBCollection = {
  monthlyExpense: "expenseTransaction",
};

export const vTransApiEndPoint = {
  getBillList: "getBillList",
};

// wallet Condtants
export const walletPageNames = [
  { name: "Dashboard" },
  { name: "Transactions" },
  { name: "Add/Edit Transaction" },
  { name: "Reports Page" },
  { name: "Settings Page" },
  { name: "Profile Page" },
];

export const TransactionType = {
  credit: "credit",
  debit: "debit",
};

export enum MasterType {
  Party = "party",
  Truck = "truck",
  Location = "location",
  ExpenseType = "expenseType",
  Proprietor = "proprietor",
}

export const masterTypes = [
  { value: MasterType.Party, label: "Party" },
  { value: MasterType.Truck, label: "Truck" },
  { value: MasterType.Location, label: "Location" },
  { value: MasterType.ExpenseType, label: "Expense Type" },
  { value: MasterType.Proprietor, label: "Proprietor" },
];

export const dataBranch = {
  master: "wallet/masters",
  bill: "wallet/bills",
  expense: "wallet/expenses",
  user: "wallet/user",
};
