import { Container, Typography, Stack } from "@mui/material";
import { AddEditBillEntry } from "./addEditBillEntry";

function BillEntryPage({ uid }: { uid: string }) {
  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Bill Entry / Daily Entry</Typography>
      </Stack>
      <AddEditBillEntry uid={uid} />
    </Container>
  );
}

export default BillEntryPage;
