import {
  Button,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { get, push, ref, set, DatabaseReference } from "firebase/database";
import { db } from "../../config/firebase";
import ReactDatePicker from "react-datepicker";

interface Bill {
  id?: string;
  partyName: string;
  billNo: string;
  truckNumber: string;
  fromLocation: string;
  toLocation: string;
  fixedAmount: number;
  billAmount: number;
  weightCharge: number;
  date: string;
}

interface MasterEntry {
  name: string;
  type: "truck" | "party" | "location" | "expense";
}

function BillEntryPage({ uid }: { uid: string }) {
  const [billDetails, setBillDetails] = useState<Bill>({
    partyName: "",
    billNo: "",
    truckNumber: "",
    fromLocation: "",
    toLocation: "",
    fixedAmount: 0,
    billAmount: 0,
    weightCharge: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showList, setShowList] = useState<boolean>(false);

  const [partyOptions, setPartyOptions] = useState<string[]>([]);
  const [truckOptions, setTruckOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [billsRef, setBillsRef] = useState<DatabaseReference | null>(null);
  const [masterRef, setMasterRef] = useState<DatabaseReference | null>(null);

  // const billsRef = ref(db, `wallet/${uid}/bills`);
  // const masterRef = ref(db, `wallet/${uid}/masters`);

  useEffect(() => {
    if (db && uid) {
      const billsReference = ref(db, `wallet/${uid}/bills`);
      const masterReference = ref(db, `wallet/${uid}/masters`);
      setBillsRef(billsReference);
      setMasterRef(masterReference);
    }
  }, [uid]);

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

  const fetchMasterOptions = useCallback(async () => {
    try {
      if (masterRef) {
        const snapshot = await get(masterRef);
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, MasterEntry>;
          const values = Object.values(data);

          setPartyOptions(
            values.filter((v) => v.type === "party").map((v) => v.name)
          );
          setTruckOptions(
            values.filter((v) => v.type === "truck").map((v) => v.name)
          );
          setLocationOptions(
            values.filter((v) => v.type === "location").map((v) => v.name)
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [masterRef]);

  useEffect(() => {
    fetchBills();
    fetchMasterOptions();
  }, [uid, fetchBills, fetchMasterOptions]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBillDetails((prev) => ({
      ...prev,
      [name]:
        name.includes("Amount") || name === "weightCharge"
          ? Number(value)
          : value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setBillDetails((prev) => ({
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
      if (selectedBillId && db) {
        // Update existing bill
        const billRef = ref(db, `wallet/${uid}/bills/${selectedBillId}`);
        await set(billRef, billDetails);
        setSuccessMessage("Bill updated successfully!");
      } else if (billsRef) {
        // Add new bill

        await push(billsRef, billDetails);
        setSuccessMessage("Bill entry saved!");
      }

      setBillDetails({
        partyName: "",
        billNo: "",
        truckNumber: "",
        fromLocation: "",
        toLocation: "",
        fixedAmount: 0,
        billAmount: 0,
        weightCharge: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedBillId(null);
      fetchBills();
    } catch (err) {
      setError("Failed to save bill.");
      console.log("Error saving bill:", err);
    }
  };

  const handleEdit = (bill: Bill) => {
    setBillDetails(bill);
    setSelectedBillId(bill.id ?? null);
    setShowList(false);
  };

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Bill Entry</Typography>
        <Button variant="outlined" onClick={() => setShowList((prev) => !prev)}>
          {showList ? "Add New Bill" : "Show All Bills"}
        </Button>
      </Stack>

      {showList ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Truck</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Bill No</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.date}</TableCell>
                <TableCell>{bill.partyName}</TableCell>
                <TableCell>{bill.truckNumber}</TableCell>
                <TableCell>{bill.fromLocation}</TableCell>
                <TableCell>{bill.toLocation}</TableCell>
                <TableCell>{bill.billNo}</TableCell>
                <TableCell>{bill.billAmount}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(bill)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Date */}
            <Grid item xs={12} md={4}>
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
                selected={new Date(billDetails.date)} // Convert the date string to a Date object
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

            {/* Party Name */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Party Name"
                name="partyName"
                value={billDetails.partyName}
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

            {/* Bill No */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Bill No"
                name="billNo"
                value={billDetails.billNo}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            {/* Truck Number */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Truck Number"
                name="truckNumber"
                value={billDetails.truckNumber}
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
                value={billDetails.fromLocation}
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
                value={billDetails.toLocation}
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

            {/* Fixed Amount */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Fixed Amount"
                name="fixedAmount"
                type="number"
                value={billDetails.fixedAmount}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            {/* Bill Amount */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Bill Amount"
                name="billAmount"
                type="number"
                value={billDetails.billAmount}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            {/* Weight Charge */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Weight Charge"
                name="weightCharge"
                type="number"
                value={billDetails.weightCharge}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" type="submit">
                {selectedBillId ? "Update Bill" : "Submit"}
              </Button>
            </Grid>

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
      )}
    </Container>
  );
}

export default BillEntryPage;
