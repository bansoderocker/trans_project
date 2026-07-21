import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import dayjs from "dayjs";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TransactionType } from "@/common/constant/constant";
import { convertAmountToWord } from "@/common/util/customLogic";
import { format, isValid } from "date-fns";
import { saveAddEditTransaction } from "@/hook/walletTranscation/saveAddEditTransaction";
import { Transaction } from "@/interface/wallet";
import { fetchTransactions } from "@/hook/walletTranscation/fetchTransaction";

// const expenseTypes = ["Income", "Need", "Want", "Gift", "Bill", "Other"];
const paymentModes = ["Kotak", "Amazon Pay", "Cash", "UPI", "Credit Card"];
const creditTypes = ["Income", "Gift"];
const debitTypes = ["Need", "Want", "Bill", "MF", "Other"];
const defaultFormData = {
  paymentDate: new Date(),
  expense: "",
  type: "",
  amount: undefined,
  paymentMode: "",
  transactionType: TransactionType.debit,
  strPaymentDate: "",
};

interface AddEditTransactionProps {
  editFormDataId?: string;
}

export const AddEditTransaction = (props: AddEditTransactionProps) => {
  const [formData, setFormData] = useState<Transaction>(defaultFormData);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTransactions();
        console.log("data", data);
        console.log("editFormData", props.editFormDataId);

        const finalData = data
          .filter((x) => x.id === props?.editFormDataId)
          .map((x) => ({
            ...x,
            // strPaymentDate:
            //   x.paymentDate instanceof Timestamp
            //     ? format(x.paymentDate.toDate(), "dd MMM yyyy")
            //     : "x.paymentDate",
          }));
        console.log(finalData[0]);
        setFormData(finalData[0]);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
      }
    };
    if (props.editFormDataId) {
      loadData();
    }
  }, [props?.editFormDataId]);

  // const [request, setRequest] = useState<Transaction>();
  // // saveAddEditTransaction(request);
  // useEffect(() => {
  //   if (request) {
  //     saveAddEditTransaction(request);
  //   }
  // }, [request]);

  const [expenseTypes, setExpenseTypes] = useState<string[]>(debitTypes);

  useEffect(() => {
    if (formData.transactionType === TransactionType.debit) {
      setExpenseTypes(debitTypes);
    } else {
      setExpenseTypes(creditTypes);
    }
  }, [formData?.transactionType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log("handleChange:");
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      paymentDate: date,
    });
    console.log("handleDateChange:");
  };

  const handleTransactionTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    setFormData({
      ...formData,
      transactionType: newType || TransactionType.debit,
    });
    console.log(
      "handleTransactionTypeChange:",
      formData,
      newType,
      Boolean(newType === "credit")
    );
  };
  const handleSubmit = async () => {
    // console.log("Transaction Saved:", formData);
    // saveAddEditTransaction(formData);
    // setFormData(defaultFormData);

    const id = await saveAddEditTransaction(formData);
    console.log("Transaction saved with ID:", id);
    setFormData(defaultFormData);
    // TODO: Save to backend
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Add / Edit Transaction
        </Typography>

        <Grid container spacing={2}>
          {/* Date */}
          <Grid item xs={6}>
            {/* <TextField
              label="Date"
              name="date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={handleChange}
            /> */}

            {/* <DatePicker
              label="Date"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(newValue) =>
                setFormData({ ...formData, date: newValue })
              }
              format="DD MMM YYYY"
            /> */}
            <DatePicker
              selected={
                formData.paymentDate
                  ? new Date(formData.paymentDate) // works for string, number, Date
                  : null
              }
              onChange={(newDate) => handleDateChange(newDate)}
              dateFormat="dd/MM/yyyy" // ⚠️ must be lowercase yyyy
            />
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {formData.paymentDate && isValid(new Date(formData.paymentDate))
                ? format(new Date(formData.paymentDate), "dd MMM yyyy")
                : "—"}
            </Typography>
          </Grid>

          {/* Expense Description */}
          <Grid item xs={12}>
            <TextField
              label="Expense Description"
              name="expense"
              fullWidth
              value={formData.expense}
              onChange={handleChange}
            />
          </Grid>
          {/* Credit/Debit Toggle */}
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={formData.transactionType}
              exclusive
              onChange={handleTransactionTypeChange}
              fullWidth
            >
              <ToggleButton
                value={TransactionType.credit}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "green",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "darkgreen",
                    },
                  },
                }}
              >
                CREDIT
              </ToggleButton>

              <ToggleButton
                value={TransactionType.debit}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "red",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "darkred",
                    },
                  },
                }}
              >
                DEBIT
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          {/* Expense Type */}
          <Grid item xs={12}>
            <TextField
              label="Expense Type"
              name="type"
              select
              fullWidth
              value={formData.type}
              onChange={handleChange}
            >
              {expenseTypes?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Debit */}
          <Grid item xs={6}>
            <TextField
              label="amount"
              name="amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography>
              {(formData.amount || 0) > 0 &&
                convertAmountToWord(formData.amount || 0)}
            </Typography>
          </Grid>
          {/* Payment Mode */}
          <Grid item xs={12}>
            <TextField
              label="Payment Mode"
              name="paymentMode"
              select
              fullWidth
              value={formData.paymentMode}
              onChange={handleChange}
            >
              {paymentModes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
            >
              Save Transaction
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
