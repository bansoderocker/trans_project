export interface BankTransaction {
  id?: string;
  proprietor: string;
  party: string;
  paymentDate: string;
  paymentAmount: number;
  remark: string;
  isdeleted?: number;
  createdBy?: string | null;
  createdOn?: string;
  modifiedBy?: string | null;
  modifiedOn?: string;
}
