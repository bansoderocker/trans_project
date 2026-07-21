import { fetchTransactions } from "@/hook/walletTranscation/fetchTransaction";
import { Transaction } from "@/interface/wallet";
import { Button, Grid, IconButton, Paper, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface propTransaction {
  setSelectedPage: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<
    React.SetStateAction<number | string | undefined>
  >;
}

export const Transactions = (props: propTransaction) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTransactions();
        console.log("data", data);
        const finalData = data.map((x) => ({
          ...x,
          strPaymentDate:
            x.paymentDate instanceof Timestamp
              ? format(x.paymentDate.toDate(), "dd MMM yyyy")
              : "x.paymentDate",
        }));
        console.log(finalData);
        setTransactions(finalData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "strPaymentDate",
      headerName: "Date",
      width: 150,
    },
    { field: "expense", headerName: "Expense", width: 200 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "amount", headerName: "Amount", type: "number", width: 120 },
    { field: "paymentMode", headerName: "Payment Mode", width: 180 },
    { field: "transactionType", headerName: "Transaction Type", width: 180 },
    {
      field: "id",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="primary">
          <EditIcon
            onClick={() => {
              props?.setFormData(params.id);
              props?.setSelectedPage(2);
            }}
          />
        </IconButton>
      ),
    },
  ];

  const [screenHeight, setScreenHeight] = useState(500);
  const [screenWidth, setScreenWidth] = useState(500);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenHeight(window.screen.height);
      setScreenWidth(window.screen.width);
    }
  }, []);

  return (
    <Grid>
      <Grid>
        <Grid>
          <Typography>Welcome to Transactions</Typography>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => props?.setSelectedPage(2)}
            //AddEditTransaction 2 - hardcorded
          >
            Add Transaction
          </Button>
        </Grid>
      </Grid>
      <Paper sx={{ height: screenHeight - 220, width: screenWidth }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          sx={{ height: screenHeight - 220 }} // ✅ set height here
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>
    </Grid>
  );
};
