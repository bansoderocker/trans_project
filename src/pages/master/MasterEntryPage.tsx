"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { db } from "../../config/firebase";

import {
  ref,
  push,
  get,
  remove,
  update,
  DatabaseReference,
  child,
} from "firebase/database";

import { MasterEntry, MasterFormData, MasterFormProps } from "@/interface";

import "bootstrap/dist/css/bootstrap.min.css";
import { useMasterData } from "@/hook/useMasterData";
import { dataBranch } from "@/common/constant/constant";

const masterTypes = [
  { value: "party", label: "Party" },
  { value: "truck", label: "Truck" },
  { value: "location", label: "Location" },
  { value: "expenseType", label: "Expense Type" },
  { value: "proprietor", label: "Proprietor" },
];

function MasterEntryPage({ uid, title = "Master Manager" }: MasterFormProps) {
  const [formData, setFormData] = useState<MasterFormData>({
    name: "",
    type: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [masterRef, setMasterRef] = useState<DatabaseReference>();

  const { entries, loading, refresh } = useMasterData();

  useEffect(() => {
    const refPath = dataBranch.master;
    setMasterRef(ref(db, refPath));
  }, [uid]);

  // const fetchEntries = useCallback(async () => {
  //   try {
  //     if (masterRef) {
  //       const snapshot = await get(masterRef);

  //       if (snapshot.exists()) {
  //         const data = snapshot.val();

  //         const list = Object.keys(data).map((key) => ({
  //           id: key,
  //           ...data[key],
  //         }));

  //         setEntries(list);
  //       } else {
  //         setEntries([]);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error fetching master data:", err);
  //   }
  // }, [masterRef]);

  // useEffect(() => {
  //   fetchEntries();
  // }, [fetchEntries]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);

    const { name, type } = formData;

    if (!name.trim() || !type) {
      setError("Both name and type are required.");
      return;
    }

    try {
      if (masterRef) {
        if (editId) {
          await update(child(masterRef, editId), formData);

          setSuccessMessage("Entry updated successfully");
        } else {
          formData.createdBy = uid;

          await push(masterRef, formData);

          setSuccessMessage("Entry added successfully");
        }

        setFormData({
          name: "",
          type: "",
        });

        setEditId(null);

        // fetchEntries();
        refresh();
      } else {
        console.log("masterRef was missing: ", masterRef);
      }
    } catch (e) {
      setError("Error saving entry: " + e);
    }
  };

  const handleEdit = (entry: MasterEntry) => {
    setFormData({
      name: entry.name,
      type: entry.type,
    });

    setEditId(entry.id || null);
  };

  const handleDelete = async (entryId: string) => {
    try {
      const entryRef = ref(db, `${dataBranch.master}/${entryId}`);

      await remove(entryRef);

      // fetchEntries();
      refresh();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      party: true,
      truck: false,
      location: false,
      expenseType: false,
      proprietor: false,
    },
  );

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  const groupedEntries = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = [];
      }

      acc[entry.type].push(entry);

      return acc;
    },
    {} as Record<string, MasterEntry[]>,
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-4">{title}</h3>

      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end">
          {/* Name */}
          <div className="col-12 col-md-4">
            <label className="form-label">Name</label>

            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Type */}
          <div className="col-12 col-md-4">
            <label className="form-label">Type</label>

            <select
              className="form-select"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              required
            >
              <option value="">Select Type</option>

              {masterTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Button */}
          <div className="col-12 col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              {editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* Success */}
      {successMessage && (
        <div className="alert alert-success mt-3">{successMessage}</div>
      )}

      {/* Table */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {masterTypes.map(({ value, label }) => {
              const list = groupedEntries[value] || [];

              if (!list.length) return null;

              const expanded = expandedGroups[value];

              return (
                <>
                  <tr
                    className="table-secondary"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleGroup(value)}
                  >
                    <td colSpan={2} className="fw-bold">
                      {expanded ? "▼" : "▶"} {label} ({list.length})
                    </td>
                  </tr>

                  {expanded &&
                    list.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.name}</td>

                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(entry)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(entry.id!)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MasterEntryPage;
