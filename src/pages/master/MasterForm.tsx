"use client";

import { MasterFormProps } from "@/interface";
import { useMasterData } from "./useMasterData";
import { masterTypes } from "@/common/constant/constant";

export default function MasterForm({ uid, title }: MasterFormProps) {
  const {
    entries,
    formData,
    setFormData,
    editId,
    error,
    success,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useMasterData(uid);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">{title}</h3>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end">
          {/* Name */}
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>

          {/* Type */}
          <div className="col-md-4">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) =>
                setFormData((p) => ({ ...p, type: e.target.value }))
              }
            >
              <option value="">Select</option>
              {masterTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Button */}
          <div className="col-md-4">
            <button className="btn btn-primary w-100">
              {editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Messages */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}

      {/* TABLE */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.type}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(e)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(e.id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
