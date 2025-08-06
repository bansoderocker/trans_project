import { getInitials } from "@/common/util/customLogic";
import { useBilEntryListData } from "@/hook/useBillEntryListData";
import { Bill } from "@/interface/billEntry";
import { Grid, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface BillEntryListProps {
  uid?: string;
  filter?: Bill;
  setSelectedBillDetails?: Dispatch<SetStateAction<Bill | undefined>>;
}

// type Order = "asc" | "desc";

const BillEntryListTable = ({}: BillEntryListProps) => {
  // const [order, setOrder] = useState<Order>("asc");
  // const [orderBy, setOrderBy] = useState<keyof Bill>("billNo");
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [trigger, setTrigger] = useState<boolean>(true);

  const [result, setResult] = useState<Bill[]>();

  const data = useBilEntryListData();
  useEffect(() => {
    // const data = useBilEntryListData();
    if (Array.isArray(data)) {
      setResult(data);
      setTrigger(true);
    } else {
      setResult(undefined);
    }
  }, [data]);

  useEffect(() => {
    if (trigger && Array.isArray(result)) {
      const data = result.map((v) => ({
        ...v,
        displayBillName: getInitials(v.proprietor) + " " + v.billNo,
      }));

      setAllBills(data);
    }
    setTrigger(false);
  }, [result, trigger]);

  // const handleSort = (property: keyof Bill) => {
  //   const isAsc = orderBy === property && order === "asc";
  //   setOrder(isAsc ? "desc" : "asc");
  //   setOrderBy(property);
  // };

  // const sortedBills = [...(allBills ?? [])].sort((a, b) => {
  //   const aVal = a[orderBy];
  //   const bVal = b[orderBy];

  //   if (aVal === undefined || bVal === undefined) return 0;

  //   if (typeof aVal === "string" && typeof bVal === "string") {
  //     return order === "asc"
  //       ? aVal.localeCompare(bVal)
  //       : bVal.localeCompare(aVal);
  //   }

  //   if (typeof aVal === "number" && typeof bVal === "number") {
  //     return order === "asc" ? aVal - bVal : bVal - aVal;
  //   }
  //   if (orderBy === "date") {
  //     return order === "asc"
  //       ? new Date(a.date).getTime() - new Date(b.date).getTime()
  //       : new Date(b.date).getTime() - new Date(a.date).getTime();
  //   }

  //   return 0;
  // });

  // const handleEdit = (bill: Bill) => {
  //   if (bill !== undefined && setSelectedBillDetails) {
  //     console.log("bill", bill);
  //     setSelectedBillDetails(bill);
  //   }
  //   // setShowList(false);
  // };

  // useEffect(() => {
  //   if (filterValue && allBills) {
  //     const result = allBills.filter(
  //       (x) => x.partyName == filterValue?.partyName
  //     );
  //     setAllBills(result);
  //   } else {
  //     setTrigger(true);
  //   }
  // }, [filterValue, allBills]);

  // const columns = [];
  const [screenHeight, setScreenHeight] = useState(500);
  const [screenWidth, setScreenWidth] = useState(500);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenHeight(window.screen.height);
      setScreenWidth(window.screen.width);
    }
  }, []);

  const columns = [
    { field: "date", headerName: "Date", width: 100 },
    { field: "displayBillName", headerName: "Bill Number", width: 100 },
    { field: "truckNumber", headerName: "Truck Number", width: 120 },
    { field: "fromLocation", headerName: "From", width: 150 },
    { field: "toLocation", headerName: "To", width: 150 },
    // { field: "billAmount", headerName: "Bill Amount", width: 100 },
    // { field: "fixedAmount", headerName: "Fixed", width: 100 },
    // { field: "weightCharge", headerName: "Weight", width: 100 },
    { field: "action", headerName: "Action", width: 100 },
  ];
  return (
    <Grid>
      <Paper sx={{ height: screenHeight - 220, width: screenWidth }}>
        <DataGrid
          rows={allBills}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          sx={{ border: 1 }}
          isRowSelectable={() => false}
        />
      </Paper>{" "}
    </Grid>
  );
};

export default BillEntryListTable;
