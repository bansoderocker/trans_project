import { dataBranch } from "@/common/constant/constant";
import { db } from "@/config/firebase";
import { MasterEntry } from "@/interface";
import { get, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";

export const useMasterData = (masterTrigger: boolean) => {
  const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const masterRef = ref(db, dataBranch.master);
      const snapshot = await get(masterRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        const list: MasterEntry[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setEntries(list);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Error fetching master data:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, masterTrigger]);

  return {
    entries,
    loading,
    error,
    refresh: fetchEntries,
  };
};