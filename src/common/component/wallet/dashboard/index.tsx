import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { get, ref } from "firebase/database";
import { dataBranch } from "@/common/constant/constant";
import { db } from "@/config/firebase";
import { BankTransaction } from "@/interface/bankTransaction";

interface BillParticular {
  incomes?: { amount?: number | string }[];
  payment?: { amount?: number | string };
}

interface BillRecord {
  party?: string;
  proprietor?: string;
  isTrash?: boolean;
  particular?: BillParticular[] | Record<string, BillParticular>;
}

interface OutstandingSummary {
  billed: number;
  billPayments: number;
  bankPayments: number;
  settled: number;
  outstanding: number;
  byProprietor: BalanceGroup[];
  byParty: BalanceGroup[];
}

interface BalanceGroup {
  id: string;
  name: string;
  billed: number;
  billPayments: number;
  bankPayments: number;
  settled: number;
  outstanding: number;
}

interface LedgerAccount {
  partyId: string;
  proprietorId: string;
  billed: number;
  billPayments: number;
  bankPayments: number;
  settled: number;
  outstanding: number;
}

interface MasterRecord {
  name?: string;
  type?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const WalletDashboard = () => {
  const [summary, setSummary] = useState<OutstandingSummary>({
    billed: 0,
    billPayments: 0,
    bankPayments: 0,
    settled: 0,
    outstanding: 0,
    byProprietor: [],
    byParty: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const [billsSnapshot, paymentsSnapshot, mastersSnapshot] = await Promise.all([
          get(ref(db, dataBranch.bill)),
          get(ref(db, dataBranch.bankTransaction)),
          get(ref(db, dataBranch.master)),
        ]);
        const bills = billsSnapshot.exists()
          ? (Object.values(billsSnapshot.val()) as BillRecord[])
          : [];
        const bankPayments = paymentsSnapshot.exists()
          ? (Object.values(paymentsSnapshot.val()) as BankTransaction[])
          : [];
        const masters = mastersSnapshot.exists()
          ? (mastersSnapshot.val() as Record<string, MasterRecord>)
          : {};
        const accounts = new Map<string, LedgerAccount>();

        const getAccount = (partyId: string, proprietorId: string) => {
          const key = JSON.stringify([partyId, proprietorId]);
          let account = accounts.get(key);
          if (!account) {
            account = {
              partyId,
              proprietorId,
              billed: 0,
              billPayments: 0,
              bankPayments: 0,
              settled: 0,
              outstanding: 0,
            };
            accounts.set(key, account);
          }
          return account;
        };

        bills.filter((bill) => !bill.isTrash).forEach((bill) => {
          const account = getAccount(bill.party ?? "", bill.proprietor ?? "");
          const particulars = Array.isArray(bill.particular)
            ? bill.particular
            : Object.values(bill.particular ?? {});

          particulars.forEach((particular) => {
            account.billed += (particular.incomes ?? []).reduce(
              (total, income) => total + (Number(income.amount) || 0),
              0,
            );
            account.billPayments += Number(particular.payment?.amount) || 0;
          });
        });

        bankPayments
          .filter((payment) => payment.isdeleted !== 1)
          .forEach((payment) => {
            const account = getAccount(payment.party, payment.proprietor);
            account.bankPayments += Number(payment.paymentAmount) || 0;
          });

        const ledgerAccounts = [...accounts.values()].map((account) => {
          const paid = account.billPayments + account.bankPayments;
          const outstanding = Math.max(0, account.billed - paid);
          return {
            ...account,
            settled: account.billed - outstanding,
            outstanding,
          };
        });

        const buildGroups = (
          idField: "partyId" | "proprietorId",
          type: "party" | "proprietor",
        ): BalanceGroup[] => {
          const groups = new Map<string, BalanceGroup>();
          ledgerAccounts.forEach((account) => {
            const id = account[idField] || "unassigned";
            const group = groups.get(id) ?? {
              id,
              name: masters[id]?.name ?? (id === "unassigned" ? "Unassigned" : id),
              billed: 0,
              billPayments: 0,
              bankPayments: 0,
              settled: 0,
              outstanding: 0,
            };
            group.billed += account.billed;
            group.billPayments += account.billPayments;
            group.bankPayments += account.bankPayments;
            group.settled += account.settled;
            group.outstanding += account.outstanding;
            groups.set(id, group);
          });

          return [...groups.values()]
            .filter((group) => masters[group.id]?.type === type)
            .sort((a, b) => a.name.localeCompare(b.name));
        };

        const totals = ledgerAccounts.reduce(
          (total, account) => ({
            billed: total.billed + account.billed,
            billPayments: total.billPayments + account.billPayments,
            bankPayments: total.bankPayments + account.bankPayments,
            settled: total.settled + account.settled,
            outstanding: total.outstanding + account.outstanding,
          }),
          { billed: 0, billPayments: 0, bankPayments: 0, settled: 0, outstanding: 0 },
        );

        if (active) {
          setSummary({
            ...totals,
            byProprietor: buildGroups("proprietorId", "proprietor"),
            byParty: buildGroups("partyId", "party"),
          });
        }
      } catch (loadError) {
        console.error("Failed to load outstanding payments:", loadError);
        if (active) setError("Could not load outstanding payments.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const outstandingPercent =
    summary.billed > 0
      ? Math.min((summary.outstanding / summary.billed) * 100, 100)
      : 0;

  return (
    <Stack spacing={2} sx={{ width: "100%", alignItems: "center", py: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 1440 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Outstanding Payments
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Current unpaid balance across bills
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ width: "100%", maxWidth: 1440 }}>{error}</Alert>}

      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 1440,
          p: { xs: 2, sm: 3 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px minmax(0, 1fr)" },
          alignItems: "center",
          gap: 2,
        }}
      >
        {loading ? (
          <Box sx={{ gridColumn: "1 / -1", justifySelf: "center", py: 2 }}>
            <CircularProgress aria-label="Loading outstanding payments" />
          </Box>
        ) : (
          <>
            <Box
              role="img"
              aria-label={`Outstanding ${formatCurrency(summary.outstanding)} of ${formatCurrency(summary.billed)} billed`}
              sx={{
                width: { xs: 190, sm: 220 },
                aspectRatio: "1",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  summary.billed > 0
                    ? `conic-gradient(#d97706 ${outstandingPercent}%, #2e7d32 ${outstandingPercent}% 100%)`
                    : "#e0e0e0",
              }}
            >
              <Box
                sx={{
                  width: "82%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  OUTSTANDING
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                >
                  {formatCurrency(summary.outstanding)}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.75, sm: 3 }}
                sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
              >
                <Typography>
                  <Box component="span" sx={{ color: "#d97706", mr: 1 }}>●</Box>
                  Outstanding: {outstandingPercent.toFixed(1)}%
                </Typography>
                <Typography>
                  <Box component="span" sx={{ color: "#2e7d32", mr: 1 }}>●</Box>
                  Settled: {formatCurrency(summary.settled)}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
                  width: "100%",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <SummaryAmount label="Bill total" amount={summary.billed} />
                <SummaryAmount label="Bill payments" amount={summary.billPayments} />
                <SummaryAmount label="Bank transactions" amount={summary.bankPayments} />
                <SummaryAmount label="Settled" amount={summary.settled} />
              </Box>
            </Stack>
          </>
        )}
      </Paper>

      {!loading && !error && (
        <Box
          sx={{
            width: "100%",
            maxWidth: 1440,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: 3,
          }}
        >
          <BalanceBreakdown title="By Proprietor" groups={summary.byProprietor} />
          <BalanceBreakdown title="By Party" groups={summary.byParty} />
        </Box>
      )}
    </Stack>
  );
};

const SummaryAmount = ({ label, amount }: { label: string; amount: number }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(amount)}</Typography>
  </Box>
);

const BalanceBreakdown = ({
  title,
  groups,
}: {
  title: string;
  groups: BalanceGroup[];
}) => {
  const totalOutstanding = groups.reduce(
    (total, group) => total + group.outstanding,
    0,
  );
  const colors = ["#d97706", "#1976d2", "#2e7d32", "#c62828", "#00838f", "#6d4c41"];
  let currentPercent = 0;
  const segments = groups.map((group, index) => {
    const start = currentPercent;
    currentPercent += totalOutstanding
      ? (group.outstanding / totalOutstanding) * 100
      : 0;
    return {
      ...group,
      color: colors[index % colors.length],
      start,
      end: currentPercent,
      outstandingPercent: group.billed
        ? Math.min((group.outstanding / group.billed) * 100, 100)
        : 0,
      share: totalOutstanding ? group.outstanding / totalOutstanding : 0,
    };
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const circumference = 2 * Math.PI * 90;
  let dashOffset = 0;

  return (
    <Paper variant="outlined" sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      <Typography variant="h6" sx={{ px: 2, pt: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" },
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Stack spacing={1} sx={{ alignItems: "center", justifySelf: "center" }}>
          <Box
            sx={{
              width: { xs: 180, sm: 200 },
              maxWidth: "100%",
              aspectRatio: "1",
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 220 220"
              width="100%"
              height="100%"
              role="button"
              tabIndex={0}
              aria-label={`${title} chart. Click to view details.`}
              onClick={() => setDetailsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDetailsOpen(true);
                }
              }}
              style={{ cursor: "pointer", overflow: "visible" }}
            >
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="34"
              />
              {segments.map((group) => {
                const segmentLength = circumference * group.share;
                const segmentOffset = dashOffset;
                dashOffset += segmentLength;
                if (group.outstanding <= 0) return null;

                return (
                  <Tooltip
                    key={group.id}
                    arrow
                    title={`${group.name} (${group.outstandingPercent.toFixed(0)}%) - ${formatCurrency(group.outstanding)}`}
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      fill="none"
                      stroke={group.color}
                      strokeWidth="34"
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={-segmentOffset}
                      transform="rotate(-90 110 110)"
                      tabIndex={0}
                      role="button"
                      aria-label={`${group.name}, ${group.outstandingPercent.toFixed(0)}% outstanding, ${formatCurrency(group.outstanding)}`}
                    />
                  </Tooltip>
                );
              })}
            </svg>
            <Stack
              spacing={0.25}
              sx={{
                position: "absolute",
                inset: "27%",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                TOTAL OUTSTANDING
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                {formatCurrency(totalOutstanding)}
              </Typography>
            </Stack>
          </Box>
          <Button variant="outlined" size="small" onClick={() => setDetailsOpen(true)}>
            View details
          </Button>
        </Stack>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          {segments.length ? (
            segments.map((group) => (
              <Box
                key={group.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  py: 0.5,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{ width: 10, height: 10, flexShrink: 0, bgcolor: group.color }}
                  />
                  <Typography sx={{ overflowWrap: "anywhere" }}>{group.name}</Typography>
                </Box>
                <Box sx={{ flexShrink: 0, textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(group.outstanding)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.outstandingPercent.toFixed(0)}% outstanding
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No records
            </Typography>
          )}
        </Stack>
      </Box>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>{title} outstanding details</DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{title.replace("By ", "")}</TableCell>
                  <TableCell align="right">Bill Total</TableCell>
                  <TableCell align="right">Bill Payments</TableCell>
                  <TableCell align="right">Bank Transactions</TableCell>
                  <TableCell align="right">Settled</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                  <TableCell align="right">Outstanding %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segments.length ? (
                  segments.map((group) => (
                    <TableRow key={group.id} hover>
                      <TableCell sx={{ minWidth: 170 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            component="span"
                            aria-hidden="true"
                            sx={{ width: 10, height: 10, flexShrink: 0, bgcolor: group.color }}
                          />
                          {group.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(group.billed)}</TableCell>
                      <TableCell align="right">{formatCurrency(group.billPayments)}</TableCell>
                      <TableCell align="right">{formatCurrency(group.bankPayments)}</TableCell>
                      <TableCell align="right">{formatCurrency(group.settled)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(group.outstanding)}
                      </TableCell>
                      <TableCell align="right">
                        {group.outstandingPercent.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
            {segments.length ? (
              segments.map((group) => (
                <Paper key={group.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, overflowWrap: "anywhere" }}>
                    {group.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 1,
                    }}
                  >
                    <SummaryAmount label="Bill total" amount={group.billed} />
                    <SummaryAmount label="Bill payments" amount={group.billPayments} />
                    <SummaryAmount label="Bank transactions" amount={group.bankPayments} />
                    <SummaryAmount label="Settled" amount={group.settled} />
                    <SummaryAmount label="Outstanding" amount={group.outstanding} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Outstanding %
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {group.outstandingPercent.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No records
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};
