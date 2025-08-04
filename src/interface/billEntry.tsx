export interface Bill {
  id?: string;
  partyName: string;
  billNo: string;
  truckNumber: string;
  fromLocation: string;
  toLocation: string;
  fixedAmount: number;
  billAmount: number;
  weightCharge: number;
  date: string;
  proprietor: string;
}

export interface MasterEntry {
  name: string;
  type: "truck" | "party" | "location" | "expenseType" | "proprietor";
}

export interface addEditExpenseDetails {
  id: number;
  expenseType: string;
  expenseValue: string | number;
}
