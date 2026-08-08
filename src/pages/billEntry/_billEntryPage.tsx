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
import { Autocomplete, TextField } from "@mui/material";
import styles from "./BillEntryPage.module.css";

interface SearchableSelectProps {
  options: MasterEntry[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const SearchableSelect = ({
  options,
  value,
  placeholder,
  onChange,
}: SearchableSelectProps) => (
  <Autocomplete<MasterEntry, false, false, true>
    className={styles.searchableSelect}
    disablePortal
    freeSolo
    clearOnBlur={false}
    options={options}
    value={options.find((option) => option.id === value) ?? (value || null)}
    getOptionLabel={(option) =>
      typeof option === "string" ? option : option.name
    }
    isOptionEqualToValue={(option, selected) =>
      typeof selected !== "string" && option.id === selected.id
    }
    onChange={(_, option) =>
      onChange(typeof option === "string" ? option : option?.id ?? "")
    }
    onInputChange={(_, inputValue, reason) => {
      if (reason === "input" || reason === "clear") onChange(inputValue);
    }}
    renderInput={(params) => (
      <TextField {...params} required placeholder={placeholder} size="small" />
    )}
  />
);

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

  const resolveMasterId = (
    value: string,
    type: MasterType,
    pendingEntries: Map<string, Promise<string>>,
  ): Promise<string> => {
    const name = value.trim();
    if (!name) return Promise.reject(new Error("A dropdown value is required."));

    const cacheKey = `${type}:${name.toLowerCase()}`;
    const pendingEntry = pendingEntries.get(cacheKey);
    if (pendingEntry) return pendingEntry;

    const operation = (async () => {
      const existingEntry = entries.find(
        (entry) =>
          entry.type === type &&
          (entry.id === value || entry.name.trim().toLowerCase() === name.toLowerCase()),
      );

      if (existingEntry) return existingEntry.id;

      const newEntry = await push(ref(db, dataBranch.master), {
        name,
        type,
        createdBy: userData?.uid ?? null,
      });

      if (!newEntry.key) throw new Error(`Unable to create ${type} master entry.`);
      return newEntry.key;
    })();

    pendingEntries.set(cacheKey, operation);
    return operation;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return; // guard against double-submit
    setSubmitError(null);
    setSubmitSuccess(false);

    setSubmitting(true);

    try {
      const pendingEntries = new Map<string, Promise<string>>();
      const savedHeader = {
        ...header,
        proprietor: await resolveMasterId(
          header.proprietor,
          MasterType.Proprietor,
          pendingEntries,
        ),
        party: await resolveMasterId(
          header.party,
          MasterType.Party,
          pendingEntries,
        ),
      };
      const savedParticulars = await Promise.all(
        particular.map(async (record) => ({
          ...record,
          vehicleNo: await resolveMasterId(
            record.vehicleNo,
            MasterType.Truck,
            pendingEntries,
          ),
          fromLocation: await resolveMasterId(
            record.fromLocation,
            MasterType.Location,
            pendingEntries,
          ),
          toLocation: await resolveMasterId(
            record.toLocation,
            MasterType.Location,
            pendingEntries,
          ),
          expenses: await Promise.all(
            record.expenses.map(async (expense) => ({
              ...expense,
              expenseType: await resolveMasterId(
                expense.expenseType,
                MasterType.ExpenseType,
                pendingEntries,
              ),
            })),
          ),
        })),
      );

      if (billId) {
        const payload = {
          ...savedHeader,
          particular: savedParticulars,
          modifiedBy: userData?.uid ?? null,
          modifiedDate: new Date().toISOString(),
        };

        await update(ref(db, `${dataBranch.bill}/${billId}`), payload);
      } else {
        const payload = {
          ...savedHeader,
          particular: savedParticulars,
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
    <div className={`container py-3 py-md-4 ${styles.page}`}>
      <div className={`card shadow-sm ${styles.card}`}>
        <div className={styles.cardBody}>
          <h3 className={`mb-4 ${styles.title}`}>Bill Entry</h3>

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
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <label className="form-label" htmlFor="proprietor">
                  Select Proprietor
                </label>
                <SearchableSelect
                  options={lstProprietor}
                  value={header.proprietor}
                  placeholder="Select Proprietor"
                  onChange={(value) =>
                    setHeader((prev) => ({ ...prev, proprietor: value }))
                  }
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <label className="form-label" htmlFor="party">
                  Select Party
                </label>
                <SearchableSelect
                  options={lstParty}
                  value={header.party}
                  placeholder="Select Party"
                  onChange={(value) =>
                    setHeader((prev) => ({ ...prev, party: value }))
                  }
                />
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
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

              <div className="col-12 col-sm-6 col-xl-3">
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
                  className={`${styles.tripCard} mb-3`}
                >
                  <div
                    className={`d-flex justify-content-between align-items-center mb-3 ${styles.tripHeader}`}
                  >
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
                    <div className="col-12 col-sm-6 col-xl-3">
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
                    <div className="col-12 col-sm-6 col-xl-3">
                      <label className="form-label">Vehicle No</label>
                      <SearchableSelect
                        options={lstTruck}
                        value={record.vehicleNo}
                        placeholder="Select Vehicle"
                        onChange={(value) =>
                          handleParticularChange(record.uid, "vehicleNo", value)
                        }
                      />
                    </div>

                    {/* From */}
                    <div className="col-12 col-sm-6 col-xl-3">
                      <label className="form-label">From Location</label>
                      <SearchableSelect
                        options={lstLocation}
                        value={record.fromLocation}
                        placeholder="Select From Location"
                        onChange={(value) =>
                          handleParticularChange(record.uid, "fromLocation", value)
                        }
                      />
                    </div>

                    {/* To */}
                    <div className="col-12 col-sm-6 col-xl-3">
                      <label className="form-label">To Location</label>
                      <SearchableSelect
                        options={lstLocation}
                        value={record.toLocation}
                        placeholder="Select To Location"
                        onChange={(value) =>
                          handleParticularChange(record.uid, "toLocation", value)
                        }
                      />
                    </div>
                  </div>

                  {/* ---------- Expense lines for this record ---------- */}
                  <div className={styles.expenseSection}>
                    <div className={styles.expenseHeader}>
                      <label className="form-label fw-semibold mb-0">
                        Expenses
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
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
                        <div className="col-12 col-md-5">
                          {expenseIndex === 0 && (
                            <label className="form-label small">
                              Expense Type
                            </label>
                          )}
                          <SearchableSelect
                            options={lstExpenseType}
                            value={expense.expenseType}
                            placeholder="Select Expense Type"
                            onChange={(value) =>
                              handleExpenseChange(
                                record.uid,
                                expense.uid,
                                "expenseType",
                                value,
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-5">
                          {expenseIndex === 0 && (
                            <label className="form-label small">Amount</label>
                          )}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            placeholder="Amount"
                            aria-label="Expense amount"
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

                        <div className="col-12 col-md-2">
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

                    <div className={`text-end small text-muted ${styles.subtotal}`}>
                      Particular Subtotal: {recordSubtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              className={`d-flex justify-content-between align-items-center mb-3 ${styles.formActions}`}
            >
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addParticular}
              >
                + Add Particular
              </button>

              <div className={`d-flex align-items-center ${styles.saveGroup}`}>
                <h6 className={`mb-0 ${styles.total}`}>
                  Grand Total: <strong>{grandTotal.toFixed(2)}</strong>
                </h6>

                <button
                  type="submit"
                  className="btn btn-primary"
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
