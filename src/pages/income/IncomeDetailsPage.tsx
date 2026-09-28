import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  ref,
  get,
  push,
  update,
  remove,
  DatabaseReference,
} from "firebase/database";
import { db } from "../../config/firebase";
import {
  TextField,
  Button,
  Alert,
  Container,
  Grid,
  Typography,
  TableContainer,
  Table,
  Paper,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import ReactDatePicker from "react-datepicker";
import { dataBranch } from "@/common/constant/constant";
// import "react-datepicker/dist/react-datepicker.css";
interface Income {
  id?: string;
  date: Date;
  income: string;
  incomeType: string;
  debitCredit: "Debit" | "Credit";
  paymentAmount: number;
  paymentMode: string;
}

function IncomeDetailsPage({ uid }: { uid: string }) {
  const [incomeDetails, setIncomeDetails] = useState<Income>({
    date: new Date(),
    income: "",
    incomeType: "",
    debitCredit: "Debit",
    paymentAmount: 0,
    paymentMode: "",
  });

  const [allIncomes, setAllIncomes] = useState<Income[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [refPath, setRefPath] = useState<string>(dataBranch.income);
  const [incomeRef, setIncomeRef] = useState<DatabaseReference>();
  useEffect(() => {
    if (typeof window !== "undefined" && uid) {
      setRefPath(dataBranch.income);
    }
    if (!db) {
      console.error("Firebase database is not initialized.");
      return;
    }
    setIncomeRef(ref(db, refPath));
  }, [uid, refPath]);

  const fetchIncomes = async () => {
    try {
      if (incomeRef) {
        const snapshot = await get(incomeRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const incomesArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setAllIncomes(incomesArray);
        }
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIncomeDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    _newValue: "Debit" | "Credit",
  ) => {
    if (_newValue !== null) {
      setIncomeDetails((prev) => ({ ...prev, debitCredit: _newValue }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (incomeRef) {
        if (editId) {
          await update(ref(db, `${refPath}/${editId}`), incomeDetails);
          setSuccessMessage("Income updated successfully!");
        } else {
          await push(incomeRef, incomeDetails);
          setSuccessMessage("Income added successfully!");
        }
        fetchIncomes();
        setIncomeDetails({
          date: new Date(),
          income: "",
          incomeType: "",
          debitCredit: "Debit",
          paymentAmount: 0,
          paymentMode: "",
        });
        setEditId(null);
      }
    } catch (e) {
      setError("Error saving income: " + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (income: Income) => {
    setIncomeDetails(income);
    setEditId(income.id || null);
  };

  const handleDelete = async (id: string) => {
    try {
      if (incomeRef) {
        await remove(ref(db, `${refPath}/${id}`));
        fetchIncomes();
        setSuccessMessage("Income deleted successfully!");
      }
    } catch (error) {
      setError("Error deleting income: " + error);
    }
  };

  const totalIncome = allIncomes.reduce(
    (sum, item) => sum + Number(item.paymentAmount),
    0,
  );

  // Utility function to format date to dd/mm/yyyy
  // const formatDateToDDMMYYYY = (date: string): string => {
  //   const [year, month, day] = date.split("-");
  //   return `${day}/${month}/${year}`;
  // };

  // const formatDateToYYYYMMDD = (date: string): string => {
  //   const [day, month, year] = date.split("/");
  //   return `${year}-${month}-${day}`;
  // };
  return (
    <Container>
      <Typography variant="h4">Income Details</Typography>
      <form onSubmit={handleSubmit}>
        {/* <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ReactDatePicker
              selected={new Date(incomeDetails.date)} // Convert the date string to a Date object
              onChange={(date: Date | null) => {
                const temoraryDate = date ? date : new Date();
                setIncomeDetails((prev) => ({ ...prev, date: temoraryDate }));
              }}
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
          <Grid item xs={12} md={4}>
            <TextField
              label="Income"
              name="income"
              value={incomeDetails.income}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Income Type"
              name="IncomeType"
              value={incomeDetails.IncomeType}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={incomeDetails.debitCredit}
              exclusive
              onChange={handleToggleChange}
            >
              <ToggleButton value="Debit">Debit</ToggleButton>
              <ToggleButton value="Credit">Credit</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Payment Amount"
              name="paymentAmount"
              type="number"
              value={incomeDetails.paymentAmount}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Payment Mode"
              name="paymentMode"
              value={incomeDetails.paymentMode}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
        </Grid> */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {editId ? "Update" : "Submit"}
        </Button>
      </form>
      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      <Typography variant="h6">All Income Details</Typography>
      <Typography variant="h5">Total Income: ₹{totalIncome}</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Income</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allIncomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>
                  {new Date(income.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{income.income}</TableCell>
                <TableCell>{income.incomeType}</TableCell>
                <TableCell>₹{income.paymentAmount}</TableCell>
                <TableCell>{income.paymentMode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(income)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(income.id!)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
export default IncomeDetailsPage;
