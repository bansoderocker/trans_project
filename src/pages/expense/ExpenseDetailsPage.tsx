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
import "react-datepicker/dist/react-datepicker.css";
interface Expense {
  id?: string;
  date: Date;
  expense: string;
  expenseType: string;
  debitCredit: "Debit" | "Credit";
  paymentAmount: number;
  paymentMode: string;
}

function ExpenseDetailsPage({ uid }: { uid: string }) {
  const [expenseDetails, setExpenseDetails] = useState<Expense>({
    date: new Date(),
    expense: "",
    expenseType: "",
    debitCredit: "Debit",
    paymentAmount: 0,
    paymentMode: "",
  });

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [refPath, setRefPath] = useState<string>("wallet/expenses");
  const [expenseRef, setExpenseRef] = useState<DatabaseReference>();
  useEffect(() => {
    if (typeof window !== "undefined" && uid) {
      setRefPath(`wallet/${uid}/expenses`);
    }
    if (!db) {
      console.error("Firebase database is not initialized.");
      return;
    }
    setExpenseRef(ref(db, refPath));
  }, [uid, refPath]);

  const fetchExpenses = async () => {
    try {
      if (expenseRef) {
        const snapshot = await get(expenseRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const expensesArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setAllExpenses(expensesArray);
        }
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpenseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    _newValue: "Debit" | "Credit",
  ) => {
    if (_newValue !== null) {
      setExpenseDetails((prev) => ({ ...prev, debitCredit: _newValue }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (expenseRef) {
        if (editId) {
          await update(ref(db, `${refPath}/${editId}`), expenseDetails);
          setSuccessMessage("Expense updated successfully!");
        } else {
          await push(expenseRef, expenseDetails);
          setSuccessMessage("Expense added successfully!");
        }
        fetchExpenses();
        setExpenseDetails({
          date: new Date(),
          expense: "",
          expenseType: "",
          debitCredit: "Debit",
          paymentAmount: 0,
          paymentMode: "",
        });
        setEditId(null);
      }
    } catch (e) {
      setError("Error saving expense: " + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setExpenseDetails(expense);
    setEditId(expense.id || null);
  };

  const handleDelete = async (id: string) => {
    try {
      if (expenseRef) {
        await remove(ref(db, `${refPath}/${id}`));
        fetchExpenses();
        setSuccessMessage("Expense deleted successfully!");
      }
    } catch (error) {
      setError("Error deleting expense: " + error);
    }
  };

  const totalExpense = allExpenses.reduce(
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
      <Typography variant="h4">Expense Details</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ReactDatePicker
              selected={new Date(expenseDetails.date)} // Convert the date string to a Date object
              onChange={(date: Date | null) => {
                const temoraryDate = date ? date : new Date();
                setExpenseDetails((prev) => ({ ...prev, date: temoraryDate }));
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
              label="Expense"
              name="expense"
              value={expenseDetails.expense}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Expense Type"
              name="expenseType"
              value={expenseDetails.expenseType}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={expenseDetails.debitCredit}
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
              value={expenseDetails.paymentAmount}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Payment Mode"
              name="paymentMode"
              value={expenseDetails.paymentMode}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
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
      <Typography variant="h6">All Expense Details</Typography>
      <Typography variant="h5">Total Expense: ₹{totalExpense}</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Expense</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{expense.expense}</TableCell>
                <TableCell>{expense.expenseType}</TableCell>
                <TableCell>₹{expense.paymentAmount}</TableCell>
                <TableCell>{expense.paymentMode}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(expense)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(expense.id!)}
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
export default ExpenseDetailsPage;
