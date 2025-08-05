import { db } from "@/config/firebase";
import { Bill } from "@/interface/billEntry";
import { get, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";

export const useBilEntryListData = (): Bill[] => {
  const billsRef = ref(db, `wallet/bills`);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const fetchBills = useCallback(async () => {
    try {
      if (billsRef) {
        const snapshot = await get(billsRef);
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, Bill>;
          const list = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setAllBills(list);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [billsRef]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return allBills;
};
