import { useCallback, useEffect, useState } from "react";
import {
  fetchMasters,
  addMaster,
  updateMaster,
  deleteMaster,
} from "./masterService";

import { MasterEntry, MasterFormData } from "@/interface";

export function useMasterData(uid: string) {
  const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [formData, setFormData] = useState<MasterFormData>({
    name: "",
    type: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const data = await fetchMasters();
    setEntries(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.type) {
      setError("Name and Type required");
      return;
    }

    try {
      if (editId) {
        await updateMaster(editId, formData);
        setSuccess("Updated successfully");
      } else {
        await addMaster({ ...formData, createdBy: uid });
        setSuccess("Added successfully");
      }

      setFormData({ name: "", type: "" });
      setEditId(null);
      loadData();
    } catch (err) {
      setError("Error: " + err);
    }
  };

  const handleEdit = (item: MasterEntry) => {
    setFormData({
      name: item.name,
      type: item.type,
    });
    setEditId(item.id || null);
  };

  const handleDelete = async (id: string) => {
    await deleteMaster(id);
    loadData();
  };

  return {
    entries,
    formData,
    setFormData,
    editId,
    error,
    success,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}