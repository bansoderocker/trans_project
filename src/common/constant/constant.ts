import { auth } from "@/config/firebase";

export const getUserData = () => {
  if (typeof window === "undefined") return null; // Server-side

  return auth.currentUser;
};
export const MAX_AMOUNT = 10000000; // 1 Crore
// const masterTypes = [
//   { value: "party", label: "Party" },
//   { value: "truck", label: "Truck" },
//   { value: "location", label: "Location" },
//   { value: "IncomeType", label: "Income Type" },
// ];

export const DBCollection = {
  monthlyIncome: "incomeTransaction",
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
  IncomeType = "IncomeType",
  Proprietor = "proprietor",
}

export const masterTypes = [
  { value: MasterType.Party, label: "Party" },
  { value: MasterType.Truck, label: "Truck" },
  { value: MasterType.Location, label: "Location" },
  { value: MasterType.IncomeType, label: "Income Type" },
  { value: MasterType.Proprietor, label: "Proprietor" },
];

export const dataBranch = {
  master: "wallet/masters",
  bill: "wallet/bills",
  income: "wallet/incomes",
  bankTransaction: "wallet/BankTransaction",
  user: "wallet/user",
};
