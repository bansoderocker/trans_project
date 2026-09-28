import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { get, ref, update } from "firebase/database";
import { dataBranch } from "@/common/constant/constant";
import { useMasterData } from "@/hook/useMasterData";
import { db } from "@/config/firebase";
import { BankTransaction } from "@/interface/bankTransaction";
import BankTransactionForm from "./BankTransactionForm";

interface Props {
  openAddOnMount?: boolean;
}

export default function BankTransactionList({
  openAddOnMount = false,
}: Props) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const { entries } = useMasterData(true);
  const nameById = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.id, entry.name])),
    [entries],
  );

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await get(ref(db, dataBranch.bankTransaction));
      const value = snapshot.exists() ? snapshot.val() : {};
      setTransactions(
        Object.entries(value as Record<string, Omit<BankTransaction, "id">>)
          .map(([id, transaction]) => ({ id, ...transaction }))
          .filter((transaction) => transaction.isdeleted !== 1)
          .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)),
      );
    } catch (loadError) {
      console.error("Failed to load bank transactions:", loadError);
      setError("Could not load bank transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (openAddOnMount) {
      setEditingId(undefined);
      setFormOpen(true);
    }
  }, [openAddOnMount]);

  const openAddForm = () => {
    setEditingId(undefined);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(undefined);
    void loadTransactions();
  };

  const deleteTransaction = async (id?: string) => {
    if (!id) return;
    try {
      await update(ref(db, `${dataBranch.bankTransaction}/${id}`), {
        isdeleted: 1,
      });
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (deleteError) {
      console.error("Failed to delete bank transaction:", deleteError);
      setError("Could not delete the bank transaction.");
    }
  };

  const columns: GridColDef<BankTransaction>[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton
            aria-label="Edit bank transaction"
            color="primary"
            onClick={() => {
              setEditingId(row.id);
              setFormOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="Delete bank transaction"
            color="error"
            onClick={() => deleteTransaction(row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
    {
      field: "paymentDate",
      headerName: "Payment Date",
      minWidth: 150,
      flex: 0.8,
    },
    {
      field: "proprietor",
      headerName: "Proprietor",
      minWidth: 180,
      flex: 1,
      valueGetter: (_value, row) => nameById[row.proprietor] ?? row.proprietor,
    },
    {
      field: "party",
      headerName: "Party",
      minWidth: 180,
      flex: 1,
      valueGetter: (_value, row) => nameById[row.party] ?? row.party,
    },
    {
      field: "paymentAmount",
      headerName: "Payment Amount",
      type: "number",
      minWidth: 150,
    },
    { field: "remark", headerName: "Remark", minWidth: 200, flex: 1 },
    
  ];

  return (
    <Stack spacing={2} sx={{ width: "100%", minWidth: 0, alignSelf: "stretch" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Bank Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage proprietor and party payments.
          </Typography>
        </Box>
        <Button variant="contained" onClick={openAddForm} sx={{ flexShrink: 0 }}>
          Add Bank Transaction
        </Button>
      </Box>
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={loadTransactions}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
            
          
      <Paper sx={{ height: { xs: 520, md: 620 }, width: "100%", minWidth: 0 }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
      <Dialog
        open={formOpen}
        onClose={closeForm}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <BankTransactionForm transactionId={editingId} onBack={closeForm} />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
