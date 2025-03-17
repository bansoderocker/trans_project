import { useState, ChangeEvent, FormEvent } from "react";
import { ref, get, push, update, remove } from "firebase/database";
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

interface Expense {
  id?: string;
  date: string;
  expense: string;
  expenseType: string;
  debitCredit: "Debit" | "Credit";
  paymentAmount: number;
  paymentMode: string;
}

function ExpenseDetailsPage({ uid }: { uid: string }) {
  const [expenseDetails, setExpenseDetails] = useState<Expense>({
    date: new Date().toISOString().split("T")[0],
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
  const refPath = `wallet/${uid}/expenses`;
  const expenseRef = ref(db, refPath);

  const fetchExpenses = async () => {
    try {
      const snapshot = await get(expenseRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expensesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAllExpenses(expensesArray);
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
    _newValue: "Debit" | "Credit"
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
      if (editId) {
        await update(ref(db, `${refPath}/${editId}`), expenseDetails);
        setSuccessMessage("Expense updated successfully!");
      } else {
        await push(expenseRef, expenseDetails);
        setSuccessMessage("Expense added successfully!");
      }
      fetchExpenses();
      setExpenseDetails({
        date: new Date().toISOString().split("T")[0],
        expense: "",
        expenseType: "",
        debitCredit: "Debit",
        paymentAmount: 0,
        paymentMode: "",
      });
      setEditId(null);
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
      await remove(ref(db, `${refPath}/${id}`));
      fetchExpenses();
      setSuccessMessage("Expense deleted successfully!");
    } catch (error) {
      setError("Error deleting expense: " + error);
    }
  };

  const totalExpense = allExpenses.reduce(
    (sum, item) => sum + Number(item.paymentAmount),
    0
  );

  return (
    <Container>
      <Typography variant="h4">Expense Details</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={expenseDetails.date}
              onChange={handleInputChange}
              fullWidth
              required
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
                <TableCell>{expense.date}</TableCell>
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
