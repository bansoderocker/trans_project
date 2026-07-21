export interface MasterEntry {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

export interface MasterFormProps {
  uid: string;
  title?: string; // Optional if you want to pass "Master Manager"
}

export interface MasterFormData {
  name: string;
  type: string;
  createdBy?: string;
  key?: string;
}
