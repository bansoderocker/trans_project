// firestoreUtils.ts
import { collection, getDocs } from "firebase/firestore";
import { Transaction } from "@/interface/wallet";
import { DBCollection } from "@/common/constant/constant";
import { db2 } from "@/config/firebase";

export async function fetchTransactions(id?: string): Promise<Transaction[]> {
  const querySnapshot = await getDocs(
    id
      ? collection(db2, DBCollection.monthlyExpense, id)
      : collection(db2, DBCollection.monthlyExpense)
  );
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
}
