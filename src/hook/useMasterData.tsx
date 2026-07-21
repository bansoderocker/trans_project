import { dataBranch } from "@/common/constant/constant";
import { db } from "@/config/firebase";
import { MasterEntry } from "@/interface";
import { DatabaseReference, get, ref } from "firebase/database";
import { useCallback, useEffect, useState } from "react";

export const useMasterData = () => {
  const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [masterRef, setMasterRef] = useState<DatabaseReference>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setMasterRef(ref(db, dataBranch.master));
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!masterRef) return;

    try {
      setLoading(true);
      setError(null);

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
  }, [masterRef]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    refresh: fetchEntries,
  };
};
