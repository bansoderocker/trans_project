import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { push, ref, set, DatabaseReference, get } from "firebase/database";
import { db } from "../../config/firebase";
import {
  Bill,
  addEditExpenseDetails,
  MasterEntry,
} from "@/interface/billEntry";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ReactDatePicker from "react-datepicker";
// import BillEntryListTable from "../bill/billEntryListView";

export const AddEditBillEntry = ({
  uid,
  billDetails,
}: {
  uid: string;
  billDetails?: Bill;
}) => {
  const defaultBillDetails = {
    partyName: "",
    billNo: "",
    truckNumber: "",
    fromLocation: "",
    toLocation: "",
    fixedAmount: 0,
    billAmount: 0,
    weightCharge: 0,
    date: new Date().toISOString().split("T")[0],
    proprietor: "",
  };

  const defaultExpenseDetails = {
    id: 0,
    expenseType: "",
    expenseValue: "",
  };

  const [expenseFormData, setExpenseFormData] = useState<addEditExpenseDetails>(
    defaultExpenseDetails
  );

  const [formData, setFormData] = useState<Bill>(
    billDetails ?? defaultBillDetails
  );

  useEffect(() => {
    setSelectedBillId(billDetails?.id);
  }, [billDetails]);

  const [selectedBillId, setSelectedBillId] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [partyOptions, setPartyOptions] = useState<string[]>([]);
  const [truckOptions, setTruckOptions] = useState<string[]>([]);
  const [expenseOptions, setExpenseOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [proprietorOptions, setProprietorOptions] = useState<string[]>([]);
  const [billsRef, setBillsRef] = useState<DatabaseReference | null>(null);
  const [masterRef, setMasterRef] = useState<DatabaseReference | null>(null);
  // const [filter, setFilter] = useState<Bill>();
  const [isFilterApply, setIsFilterApply] = useState<boolean>(false);
  useEffect(() => {
    if (db && uid) {
      const billsReference = ref(db, `wallet/bills`);
      const masterReference = ref(db, `wallet/masters`);
      setBillsRef(billsReference);
      setMasterRef(masterReference);
    }
  }, [uid]);

  const fetchMasterOptions = useCallback(async () => {
    try {
      if (masterRef) {
        const snapshot = await get(masterRef);
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, MasterEntry>;
          const values = Object.values(data);
          console.log("values", values);
          setPartyOptions(
            values.filter((v) => v.type === "party").map((v) => v.name)
          );
          setTruckOptions(
            values.filter((v) => v.type === "truck").map((v) => v.name)
          );
          setLocationOptions(
            values.filter((v) => v.type === "location").map((v) => v.name)
          );
          setProprietorOptions(
            values.filter((v) => v.type === "proprietor").map((v) => v.name)
          );
          setExpenseOptions(
            values.filter((v) => v.type === "expenseType").map((v) => v.name)
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [masterRef]);

  useEffect(() => {
    fetchMasterOptions();
  }, [uid, fetchMasterOptions]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Amount") || name === "weightCharge"
          ? Number(value)
          : value,
    }));
  };
  const handleExpenseChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpenseFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Amount") || name === "weightCharge"
          ? Number(value)
          : value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toLocaleDateString("en-CA"), // Convert to format for input
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      if (formData.id && db) {
        // Update existing bill
        const billRef = ref(db, `wallet/bills/${selectedBillId}`);
        await set(billRef, formData);
        setSuccessMessage("Bill updated successfully!");
      } else if (billsRef) {
        // Add new bill

        await push(billsRef, formData);
        setSuccessMessage("Bill entry saved!");
      }

      setFormData(defaultBillDetails);
      setSelectedBillId(undefined);
    } catch (err) {
      setError("Failed to save bill.");
      console.log("Error saving bill:", err);
    }
  };

  // const filterData = () => {
  //   console.log("formData", formData);
  //   // setFilter(formData);
  //   setIsFilterApply(true);
  // };
  const resetFilterData = () => {
    console.log("resetFilterData", formData);
    // setFilter(undefined);
    setIsFilterApply(false);
  };

  const expenseColumns: GridColDef[] = [
    { field: "expenseType", headerName: "Name", width: 200 },
    { field: "expenseValue", headerName: "Description", width: 300 },
  ];

  const [expenseRows, setExpenseRows] = useState<addEditExpenseDetails[]>();

  const updateExpenseList = () => {
    if (
      expenseFormData &&
      expenseFormData.expenseType &&
      expenseFormData.expenseValue
    ) {
      // setExpenseRows([expenseFormData]);
      const obj = expenseFormData;
      obj.id = expenseRows?.length || 0;
      setExpenseRows((prev) => {
        const existing = prev ?? [];
        const alreadyExists = existing.some(
          (row) => row.expenseType === obj.expenseType
        );
        return alreadyExists ? existing : [...existing, obj];
      });
      setExpenseFormData(defaultExpenseDetails);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Date */}
          <Grid item xs={6} md={2}>
            {/* <TextField
                label="Date"
                name="date"
                type="date"
                fullWidth
                value={billDetails.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              /> */}
            <ReactDatePicker
              selected={new Date(formData.date)} // Convert the date string to a Date object
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy" // Display format
              popperClassName="datepicker-zindex" // Custom class for z-index
              customInput={
                <TextField
                  label="Date"
                  name="date"
                  fullWidth
                  required
                  variant="outlined"
                />
              }
            />
          </Grid>

          {/* proprietor Name */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Properighter Name"
              name="proprietor"
              value={formData.proprietor}
              onChange={handleInputChange}
              fullWidth
            >
              {proprietorOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Bill No */}
          <Grid item xs={6} md={2}>
            <TextField
              label="Bill No"
              name="billNo"
              value={formData.billNo}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          {/* Party Name */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Party Name"
              name="partyName"
              value={formData.partyName}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {partyOptions.map((party) => (
                <MenuItem key={party} value={party}>
                  {party}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Truck Number */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Truck Number"
              name="truckNumber"
              value={formData.truckNumber}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {truckOptions.map((truck) => (
                <MenuItem key={truck} value={truck}>
                  {truck}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* From Location */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="From"
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {locationOptions.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* To Location */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="To"
              name="toLocation"
              value={formData.toLocation}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {locationOptions.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fixed Amount
          <Grid item xs={12} md={4}>
            <TextField
              label="Fixed Amount"
              name="fixedAmount"
              type="number"
              value={formData.fixedAmount}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid> */}

          {/* Bill Amount */}

          {/* Weight Charge */}
          {/* <Grid item xs={12} md={4}>
            <TextField
              label="Weight Charge"
              name="weightCharge"
              type="number"
              value={formData.weightCharge}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid> */}
          {formData.billNo && (
            <>
              <Grid item xs={12} md={6}>
                <Typography>Add Expense</Typography>
                <TextField
                  select
                  label="Expense Type"
                  name="expenseType"
                  value={expenseFormData.expenseType}
                  onChange={handleExpenseChange}
                  fullWidth
                  required
                >
                  {expenseOptions.map((ex) => (
                    <MenuItem key={ex} value={ex}>
                      {ex}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Value"
                  name="expenseValue"
                  type="number"
                  value={expenseFormData.expenseValue}
                  onChange={handleExpenseChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={updateExpenseList}>
                  Add Expense
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography>View Expense</Typography>
                <Paper sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={expenseRows}
                    columns={expenseColumns}
                    pageSizeOptions={[5, 10]}
                    sx={{ border: 1 }}
                  />
                </Paper>{" "}
              </Grid>
            </>
          )}
          <Grid item xs={12} md={6}></Grid>
          <Grid item xs={1}>
            <Button variant="contained" type="submit">
              {selectedBillId ? "Update Bill" : "Save"}
            </Button>
          </Grid>

          {/* <Grid item xs={1}>
            <Button variant="contained" onClick={filterData}>
              {"Search"}
            </Button>
          </Grid> */}

          {isFilterApply && (
            <Grid item xs={1}>
              <Button variant="contained" onClick={resetFilterData}>
                {"reset"}
              </Button>
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          {successMessage && (
            <Grid item xs={12}>
              <Alert severity="success">{successMessage}</Alert>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
};

export default AddEditBillEntry;
