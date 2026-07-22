"use client";

import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMasterData } from "@/hook/useMasterData";
import { MasterEntry } from "@/interface";
import {
  dataBranch,
  getUserData,
  MasterType,
} from "@/common/constant/constant";
import { User } from "firebase/auth";
import { get, push, ref, update } from "firebase/database";
import { db } from "@/config/firebase";

// One expense line (Expense Type + Amount) inside a trip record
interface ExpenseLine {
  uid: string;
  expenseType: string;
  amount: string;
}

// One trip record: Vehicle No / From / To + multiple expense lines
interface TripParticular {
  uid: string;
  particularDate: string;
  vehicleNo: string;
  fromLocation: string;
  toLocation: string;
  expenses: ExpenseLine[];
}
export interface BillHeader {
  proprietor: string;
  party: string;
  billNo: string;
  date: string;

  createdBy?: string;
  createdOn?: string;
  modifiedBy?: string;
  modifiedOn?: string;
}
const makeUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const newExpenseLine = (): ExpenseLine => ({
  uid: makeUid(),
  expenseType: "",
  amount: "",
});

const newTripParticular = (): TripParticular => ({
  uid: makeUid(),
  particularDate: "",
  vehicleNo: "",
  fromLocation: "",
  toLocation: "",
  expenses: [newExpenseLine()],
});

// Header no longer carries createdBy/createdOn — those are stamped at submit time
const initialHeader: BillHeader = {
  proprietor: "",
  party: "",
  billNo: "",
  date: "",
};
interface Props {
  billId?: string | null;
  onBack: () => void;
}
export default function BillEntryPage({ billId, onBack }: Props) {
  const { entries } = useMasterData();

  const [lstProprietor, setLstProprietor] = useState<MasterEntry[]>([]);
  const [lstParty, setLstParty] = useState<MasterEntry[]>([]);
  const [lstTruck, setLstTruck] = useState<MasterEntry[]>([]);
  const [lstLocation, setLstLocation] = useState<MasterEntry[]>([]);
  const [lstExpenseType, setLstExpenseType] = useState<MasterEntry[]>([]);

  useEffect(() => {
    setLstProprietor(entries.filter((x) => x.type === MasterType.Proprietor));
    setLstParty(entries.filter((x) => x.type === MasterType.Party));
    setLstTruck(entries.filter((x) => x.type === MasterType.Truck));
    setLstLocation(entries.filter((x) => x.type === MasterType.Location));
    setLstExpenseType(entries.filter((x) => x.type === MasterType.ExpenseType));
  }, [entries]);

  useEffect(() => {
    if (!billId) return;

    const billRef = ref(db, `${dataBranch.bill}/${billId}`);

    get(billRef).then((snapshot) => {
      if (!snapshot.exists()) return;

      const bill = snapshot.val();

      setHeader({
        proprietor: bill.proprietor ?? "",
        party: bill.party ?? "",
        billNo: bill.billNo ?? "",
        date: bill.date ?? "",
        createdBy: bill.createdBy ?? "",
        createdOn: bill.createdOn ?? "",
      });

      setParticulars(bill.particular);
    });
  }, [billId]);

  const userData: User | null = getUserData();
  // Header-level fields (shared across the bill)

  const [header, setHeader] = useState(initialHeader);

  const displayDate = (date?: string | null): string => {
    if (!date) return "";

    return new Date(date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  // Multiple trip particulars, each with its own expense lines
  const [particular, setParticulars] = useState<TripParticular[]>([
    newTripParticular(),
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  // ---- Particular-level handlers ----
  const handleParticularChange = (
    recordUid: string,
    field: "vehicleNo" | "fromLocation" | "toLocation" | "particularDate",
    value: string,
  ) => {
    setParticulars((prev) =>
      prev.map((r) => (r.uid === recordUid ? { ...r, [field]: value } : r)),
    );
  };

  const addParticular = () => {
    setParticulars((prev) => [...prev, newTripParticular()]);
  };

  const removeParticular = (recordUid: string) => {
    setParticulars((prev) =>
      prev.length > 1 ? prev.filter((r) => r.uid !== recordUid) : prev,
    );
  };

  // ---- Expense-line-level handlers (nested inside a record) ----
  const handleExpenseChange = (
    recordUid: string,
    expenseUid: string,
    field: "expenseType" | "amount",
    value: string,
  ) => {
    setParticulars((prev) =>
      prev.map((r) =>
        r.uid === recordUid
          ? {
              ...r,
              expenses: r.expenses.map((ex) =>
                ex.uid === expenseUid ? { ...ex, [field]: value } : ex,
              ),
            }
          : r,
      ),
    );
  };

  const addExpenseLine = (recordUid: string) => {
    setParticulars((prev) =>
      prev.map((r) =>
        r.uid === recordUid
          ? { ...r, expenses: [...r.expenses, newExpenseLine()] }
          : r,
      ),
    );
  };

  const removeExpenseLine = (recordUid: string, expenseUid: string) => {
    setParticulars((prev) =>
      prev.map((r) =>
        r.uid === recordUid
          ? {
              ...r,
              expenses:
                r.expenses.length > 1
                  ? r.expenses.filter((ex) => ex.uid !== expenseUid)
                  : r.expenses,
            }
          : r,
      ),
    );
  };

  // Grand total across every record and every expense line
  const grandTotal = (particular ?? []).reduce(
    (recSum, r) =>
      recSum +
      (r.expenses ?? []).reduce(
        (exSum, ex) => exSum + (parseFloat(ex.amount) || 0),
        0,
      ),
    0,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return; // guard against double-submit
    setSubmitError(null);
    setSubmitSuccess(false);

    setSubmitting(true);

    try {
      if (billId) {
        const payload = {
          ...header,
          particular,
          modifiedBy: userData?.uid ?? null,
          modifiedDate: new Date().toISOString(),
        };

        await update(ref(db, `${dataBranch.bill}/${billId}`), payload);
      } else {
        const payload = {
          ...header,
          particular,
          createdBy: userData?.uid ?? null,
          createdOn: new Date().toISOString(),
        };

        await push(ref(db, dataBranch.bill), payload);
      }

      onBack();

      setHeader(initialHeader);
      setParticulars([newTripParticular()]);
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Failed to save bill entry:", err);
      setSubmitError("Something went wrong while saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-4">Bill Entry</h3>

          {submitError && (
            <div className="alert alert-danger" role="alert">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="alert alert-success" role="alert">
              Bill saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ---------- Header fields ---------- */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label" htmlFor="proprietor">
                  Select Proprietor
                </label>
                <select
                  id="proprietor"
                  className="form-select"
                  name="proprietor"
                  value={header?.proprietor}
                  onChange={handleHeaderChange}
                  required
                >
                  <option value="">Select Proprietor</option>
                  {lstProprietor.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="party">
                  Select Party
                </label>
                <select
                  id="party"
                  className="form-select"
                  name="party"
                  value={header?.party}
                  onChange={handleHeaderChange}
                  required
                >
                  <option value="">Select Party</option>
                  {lstParty.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="billNo">
                  Bill No
                </label>
                <input
                  id="billNo"
                  type="text"
                  className="form-control"
                  name="billNo"
                  value={header?.billNo}
                  onChange={handleHeaderChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="date">
                  Date {displayDate(header?.date)}
                </label>
                <input
                  id="date"
                  type="date"
                  className="form-control"
                  name="date"
                  value={header?.date}
                  onChange={handleHeaderChange}
                  required
                />
              </div>
            </div>

            <hr />

            {/* ---------- Trip particular (Vehicle / From / To + Expenses) ---------- */}
            {particular.map((record, recordIndex) => {
              const recordSubtotal = record.expenses.reduce(
                (sum, ex) => sum + (parseFloat(ex.amount) || 0),
                0,
              );

              return (
                <div
                  key={record.uid}
                  className="border rounded p-3 mb-3 bg-light-subtle"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Particular #{recordIndex + 1}</h6>

                    {particular.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeParticular(record.uid)}
                      >
                        Remove Particular
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    {/*Particular Date*/}
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="date">
                        Particular Date {displayDate(record.particularDate)}
                      </label>
                      <input
                        id="date"
                        type="date"
                        className="form-control"
                        name="date"
                        value={record.particularDate}
                        onChange={(e) =>
                          handleParticularChange(
                            record.uid,
                            "particularDate",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    {/* Vehicle */}
                    <div className="col-md-3">
                      <label className="form-label">Vehicle No</label>
                      <select
                        className="form-select"
                        value={record.vehicleNo}
                        onChange={(e) =>
                          handleParticularChange(
                            record.uid,
                            "vehicleNo",
                            e.target.value,
                          )
                        }
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {lstTruck.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* From */}
                    <div className="col-md-3">
                      <label className="form-label">From Location</label>
                      <select
                        className="form-select"
                        value={record.fromLocation}
                        onChange={(e) =>
                          handleParticularChange(
                            record.uid,
                            "fromLocation",
                            e.target.value,
                          )
                        }
                        required
                      >
                        <option value="">Select From Location</option>
                        {lstLocation.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* To */}
                    <div className="col-md-3">
                      <label className="form-label">To Location</label>
                      <select
                        className="form-select"
                        value={record.toLocation}
                        onChange={(e) =>
                          handleParticularChange(
                            record.uid,
                            "toLocation",
                            e.target.value,
                          )
                        }
                        required
                      >
                        <option value="">Select To Location</option>
                        {lstLocation.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ---------- Expense lines for this record ---------- */}
                  <div className="mt-3">
                    <div
                      className="d-flex justify-content-between align-items-center mb-2 px-2 py-1 rounded"
                      style={{ backgroundColor: "#e9ecef" }}
                    >
                      <label className="form-label fw-semibold mb-0">
                        Expenses
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => addExpenseLine(record.uid)}
                      >
                        + Add Expense
                      </button>
                    </div>
                    {record.expenses.map((expense, expenseIndex) => (
                      <div
                        className="row g-2 align-items-end mb-2"
                        key={expense.uid}
                      >
                        <div className="col-md-5">
                          {expenseIndex === 0 && (
                            <label className="form-label small">
                              Expense Type
                            </label>
                          )}
                          <select
                            className="form-select"
                            value={expense.expenseType}
                            onChange={(e) =>
                              handleExpenseChange(
                                record.uid,
                                expense.uid,
                                "expenseType",
                                e.target.value,
                              )
                            }
                            required
                          >
                            <option value="">Select Expense Type</option>
                            {lstExpenseType.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-5">
                          {expenseIndex === 0 && (
                            <label className="form-label small">Amount</label>
                          )}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={expense.amount}
                            onChange={(e) =>
                              handleExpenseChange(
                                record.uid,
                                expense.uid,
                                "amount",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>

                        <div className="col-md-2">
                          {record.expenses.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger w-100"
                              onClick={() =>
                                removeExpenseLine(record.uid, expense.uid)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="text-end small text-muted mt-1">
                      Particular Subtotal: {recordSubtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addParticular}
              >
                + Add Particular
              </button>

              <div className="d-flex align-items-center">
                <h6 className="mb-0">
                  Grand Total: <strong>{grandTotal.toFixed(2)}</strong>
                </h6>

                <button
                  type="submit"
                  className="btn btn-primary ms-3"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>

          {/* Preview */}
          {/* <pre className="mt-4 bg-light p-3 rounded">
            {JSON.stringify({ ...header, particular }, null, 2)}
          </pre> */}
        </div>
      </div>
    </div>
  );
}
