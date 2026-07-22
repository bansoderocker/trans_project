import { MAX_AMOUNT } from "@/common/constant/constant";
import { toWords } from "@/common/util/customLogic";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SelectedBillRow {
  billNo: string;
  grandTotal: number;
  paymentRemark: string;
  paymentAmount: string;
  isFullySettled: boolean;
}

interface Props {
  open: boolean;
  loading?: boolean;
  selectedRows: SelectedBillRow[];
  onClose: () => void;
  onSave: (
    amount: number,
    remark: string,
    isFullySettled: boolean,
  ) => Promise<void> | void;
}

export default function UpdatePaymentDialog({
  open,
  loading = false,
  selectedRows,
  onClose,
  onSave,
}: Props) {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [isFullySettled, setIsFullySettled] = useState(false);

  useEffect(() => {
    if (!open || selectedRows.length === 0) return;

    const paymentRemark = selectedRows[0].paymentRemark;
    const paymentAmount = selectedRows[0].paymentAmount;

    setAmount(paymentAmount ?? "");
    setRemark(paymentRemark ?? "");
    setIsFullySettled(selectedRows[0].isFullySettled ?? false);
  }, [open, selectedRows]);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.warning("Please enter a valid payment amount.");
      return;
    }

    await onSave(Number(amount), remark.trim(), isFullySettled);
  };

  const overallTotal = (selectedRows ?? []).reduce(
    (sum, x) => sum + Number(x.grandTotal || 0),
    0,
  );

  const groupedBills = Object.values(
    (selectedRows ?? []).reduce(
      (acc, row) => {
        if (!acc[row.billNo]) {
          acc[row.billNo] = {
            billNo: row.billNo,
            total: 0,
          };
        }

        acc[row.billNo].total += Number(row.grandTotal);

        return acc;
      },
      {} as Record<string, { billNo: string; total: number }>,
    ),
  );

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Update Payment</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Selected Bills */}
          <div>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Selected Bills ({groupedBills.length})
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bill No</TableCell>
                  <TableCell align="right">Grand Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {groupedBills.map((bill) => (
                  <TableRow key={bill.billNo}>
                    <TableCell>{bill.billNo}</TableCell>
                    <TableCell align="right">
                      ₹
                      {bill.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell>
                    <strong>Overall Total</strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      ₹
                      {overallTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Amount */}
          <TextField
            autoFocus
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "" || Number(value) >= 0) {
                setAmount(value);
              }
            }}
            slotProps={{
              htmlInput: {
                min: 0,
                max: MAX_AMOUNT,

                step: "0.01",
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                },
              },
            }}
          />
          {amount && Number(amount) > 0 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ mt: 1, fontStyle: "italic" }}
            >
              {toWords.convert(Number(amount))}
            </Typography>
          )}
          {/* Remark */}
          <TextField
            fullWidth
            label="Remark"
            multiline
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter payment remark (optional)"
          />

          {/* Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isFullySettled}
                onChange={(e) => setIsFullySettled(e.target.checked)}
              />
            }
            label="Payment Fully Settled"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
