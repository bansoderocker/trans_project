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
  displayBillName?: string;
}

export interface addEditExpenseDetails {
  id: number;
  expenseType: string;
  expenseValue: string | number;
}
