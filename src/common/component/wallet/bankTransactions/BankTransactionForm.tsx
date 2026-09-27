import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { get, push, ref, update } from "firebase/database";
import { MasterType, dataBranch, getUserData } from "@/common/constant/constant";
import { useMasterData } from "@/hook/useMasterData";
import { db } from "@/config/firebase";
import { BankTransaction } from "@/interface/bankTransaction";

interface Props {
  transactionId?: string;
  onBack: () => void;
}

const emptyForm = (): BankTransaction => ({
  proprietor: "",
  party: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentAmount: 0,
  remark: "",
});

export default function BankTransactionForm({ transactionId, onBack }: Props) {
  const { entries } = useMasterData();
  const [form, setForm] = useState<BankTransaction>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const proprietors = entries.filter((entry) => entry.type === MasterType.Proprietor);
  const parties = entries.filter((entry) => entry.type === MasterType.Party);

  useEffect(() => {
    if (!transactionId) {
      setForm(emptyForm());
      return;
    }

    get(ref(db, `${dataBranch.bankTransaction}/${transactionId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setForm({ ...emptyForm(), ...snapshot.val(), id: transactionId });
        } else {
          setError("Bank transaction not found.");
        }
      })
      .catch(() => setError("Could not load the bank transaction."));
  }, [transactionId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.paymentAmount <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = getUserData();
      const now = new Date().toISOString();
      const fields = { ...form };
      delete fields.id;
      if (transactionId) {
        await update(ref(db, `${dataBranch.bankTransaction}/${transactionId}`), {
          ...fields,
          modifiedBy: user?.uid ?? null,
          modifiedOn: now,
        });
      } else {
        await push(ref(db, dataBranch.bankTransaction), {
          ...fields,
          createdBy: user?.uid ?? null,
          createdOn: now,
        });
      }
      onBack();
    } catch (saveError) {
      console.error("Failed to save bank transaction:", saveError);
      setError("Could not save the bank transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto", py: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        {transactionId ? "Edit Bank Transaction" : "Add Bank Transaction"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter the payment details below.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Proprietor"
            value={form.proprietor}
            onChange={(event) => setForm((prev) => ({ ...prev, proprietor: event.target.value }))}
            required
          >
            {proprietors.map((entry) => <MenuItem key={entry.id} value={entry.id}>{entry.name}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Party"
            value={form.party}
            onChange={(event) => setForm((prev) => ({ ...prev, party: event.target.value }))}
            required
          >
            {parties.map((entry) => <MenuItem key={entry.id} value={entry.id}>{entry.name}</MenuItem>)}
          </TextField>
          <TextField
            label="Payment Date"
            type="date"
            value={form.paymentDate}
            onChange={(event) => setForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="Payment Amount"
            type="number"
            slotProps={{ htmlInput: { min: 0.01, step: "0.01" } }}
            value={form.paymentAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, paymentAmount: Number(event.target.value) }))}
            required
          />
          <TextField
            label="Remark"
            value={form.remark}
            onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
            multiline
            minRows={2}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
            <Button variant="outlined" onClick={onBack} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
