import { dataBranch } from "@/common/constant/constant";
import { db } from "@/config/firebase";
import { Bill } from "@/interface/billEntry";
import { get, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";

export const useBilEntryListData = (): Bill[] => {
  const billsRef = ref(db, dataBranch.bill);
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
          debugger;
          setAllBills(list.filter((f) => !f?.isTrash));
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
