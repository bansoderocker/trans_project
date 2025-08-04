import { getInitials } from "@/common/util/customLogic";
import { useBilEntryListData } from "@/hook/bill/useBilEntryListData";
import { Bill } from "@/interface/billEntry";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface BillEntryListProps {
  uid?: string;
  filter?: Bill;
  setSelectedBillDetails?: Dispatch<SetStateAction<Bill | undefined>>;
}

type Order = "asc" | "desc";

const BillEntryListTable = ({
  filter: filterValue,
  setSelectedBillDetails,
}: BillEntryListProps) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Bill>("billNo");
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [trigger, setTrigger] = useState<boolean>(true);

  const [result, setResult] = useState<Bill[]>();

  const data = useBilEntryListData();
  // const data = [] as Bill[];
  useEffect(() => {
    // const data = useBilEntryListData();
    if (Array.isArray(data)) {
      setResult(data);
    } else {
      setResult(undefined);
    }
  }, [data]);

  useEffect(() => {
    if (trigger && Array.isArray(result)) {
      setAllBills(result);
    }
    setTrigger(false);
  }, [result, trigger]);

  const handleSort = (property: keyof Bill) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedBills = [...(allBills ?? [])].sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];

    if (aVal === undefined || bVal === undefined) return 0;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }
    if (orderBy === "date") {
      return order === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    return 0;
  });

  const handleEdit = (bill: Bill) => {
    if (bill !== undefined && setSelectedBillDetails) {
      console.log("bill", bill);
      setSelectedBillDetails(bill);
    }
    // setShowList(false);
  };

  useEffect(() => {
    if (filterValue && allBills) {
      const result = allBills.filter(
        (x) => x.partyName == filterValue?.partyName
      );
      setAllBills(result);
    } else {
      setTrigger(true);
    }
  }, [filterValue, allBills]);

  // const columns = [];
  const [screenHeight, setScreenHeight] = useState(500);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenHeight(window.screen.height);
    }
  }, []);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          {/* Sorting applied to Bill Number */}
          <TableCell
            colSpan={2}
            sortDirection={orderBy === "billNo" ? order : false}
          >
            <TableSortLabel
              active={orderBy === "billNo"}
              direction={orderBy === "billNo" ? order : "asc"}
              onClick={() => handleSort("billNo")}
            >
              Bill Number
            </TableSortLabel>
          </TableCell>

          <TableCell>Truck</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Fix</TableCell>
          <TableCell>weight Charge</TableCell>
          <TableCell>
            <TableSortLabel
              direction={orderBy === "partyName" ? order : "asc"}
              onClick={() => handleSort("partyName")}
            >
              Party
            </TableSortLabel>
          </TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sortedBills.length > 0 ? (
          sortedBills.map((bill: Bill) => (
            <TableRow key={bill.id}>
              <TableCell sortDirection={orderBy === "date" ? order : false}>
                {" "}
                <TableSortLabel
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleSort("date")}
                >
                  {bill.date}{" "}
                </TableSortLabel>
              </TableCell>
              <TableCell>{getInitials(bill.proprietor || "")}</TableCell>
              <TableCell>{bill.billNo}</TableCell>
              <TableCell>{bill.truckNumber}</TableCell>
              <TableCell>{bill.fromLocation}</TableCell>
              <TableCell>{bill.toLocation}</TableCell>
              <TableCell>{bill.billAmount}</TableCell>
              <TableCell>{bill.fixedAmount}</TableCell>
              <TableCell>{bill.weightCharge}</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "partyName"}
                  direction={orderBy === "partyName" ? order : "asc"}
                  onClick={() => handleSort("partyName")}
                >
                  {bill.partyName}{" "}
                </TableSortLabel>
              </TableCell>
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
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={11}
              style={{
                height: screenHeight - 350, // adjust height as needed
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No Record Found
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default BillEntryListTable;
