export interface Transaction {
  id?: string;
  paymentDate: Date | null;
  strPaymentDate?: string | null;
  income: string;
  type: string;
  amount: number | undefined;
  paymentMode: string;
  transactionType: string;
}
