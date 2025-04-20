import { Button, Container, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Bill } from "@/interface/billEntry";
import { BillEntryList } from "./billEntryListTable";
import { AddEditBillEntry } from "./addEditBillEntry";
import { useBilEntryListData } from "@/hook/useBillEntryListData";

function BillEntryPage({ uid }: { uid: string }) {
  const [billDetails, setSelectedBillDetails] = useState<Bill | undefined>(
    undefined,
  );
  const [showList, setShowList] = useState<boolean>(false);
  const [allBills, setAllBills] = useState<Bill[]>([]);

  // const masterRef = ref(db, `wallet/${uid}/masters`);

  const result = useBilEntryListData({ uid });
  useEffect(() => {
    setAllBills(result);
  }, [result]);

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Bill Entry</Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setShowList((prev) => !prev);
            setSelectedBillDetails(undefined);
          }}
        >
          {showList ? "Add New Bill" : "Show All Bills"}
        </Button>
      </Stack>

      {showList ? (
        <BillEntryList
          allBills={allBills}
          setShowList={setShowList}
          setSelectedBillDetails={setSelectedBillDetails}
        />
      ) : (
        <AddEditBillEntry uid={uid} billDetails={billDetails} />
      )}
    </Container>
  );
}

export default BillEntryPage;
