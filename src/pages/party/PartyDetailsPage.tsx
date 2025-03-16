import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { ref, get, push } from "firebase/database";
import { db } from "../../config/firebase"; // Adjust path as needed

import {
  TextField,
  Button,
  Alert,
  Container,
  Grid,
  Typography,
  Box,
  TableContainer,
  Table,
  Paper,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { PartyDetails } from "@/interface/party";

// Define the type for party details
// interface PartyDetails {
//   partyName: string;
//   pageNumber: string;
//   contactNumber: string;
// }

function PartyDetailsPage() {
  const [partyDetails, setPartyDetails] = useState<PartyDetails>({
    id: "",
    partyName: "",
    pageNumber: "",
    contactNumber: "",
  });

  const [submittedDetails, setSubmittedDetails] = useState<PartyDetails[]>([]);
  const [allPartyDetails, setAllPartyDetails] = useState<PartyDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New state for loader

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name && value) {
      setPartyDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };

  // new firebase realtime database start
  const fetchParties = async () => {
    try {
      const partyRef = ref(db, "party");
      const snapshot = await get(partyRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("data", data);
        const partyArray = Object.keys(data).map((key) => ({
          id: key,
          partyName: data[key]?.partyName || "", // Retrieve partyName from the object
          pageNumber: data[key]?.pageNumber || "", // Retrieve pageNumber
          contactNumber: data[key]?.contactNumber || "", // Retrieve contactNumber
        }));
        setAllPartyDetails(partyArray);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching party details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("fetchParties");
    fetchParties();
  }, []);

  // new firebase realtime database end

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      try {
        const partyRef = ref(db, "partyDetails"); // Reference to the "partyDetails" node
        const newPartyRef = await push(partyRef, {
          partyName: partyDetails.partyName,
          pageNumber: partyDetails.pageNumber,
          contactNumber: partyDetails.contactNumber,
        });

        console.log("Party added successfully with ID:", newPartyRef.key);
        setSubmittedDetails([...submittedDetails, partyDetails]);
        setPartyDetails({
          id: "",
          partyName: "",
          pageNumber: "",
          contactNumber: "",
        });
        setSuccessMessage("Party details added successfully!");
        console.log("Document written with ID: ", newPartyRef.key);
      } catch (error) {
        console.error("Error adding party:", error);
      }
      // On successful submission, reset form and update the list

      // Re-fetch all party details after submitting
      fetchParties();
    } catch (e) {
      setError("Error adding document: " + e);
      console.error("Error adding document: ", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page is changed
  };

  const handleOnRowClickForEdit = (editId: string) => {
    console.log("handleOnRowClickForEdit");
    console.log(editId);
    console.log("allPartyDetails", allPartyDetails);
    const editParty = allPartyDetails.find((x) => x.id === editId);
    console.log("editParty", editParty);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Party Details
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Party Name"
              name="partyName"
              value={partyDetails.partyName}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Page Number"
              name="pageNumber"
              value={partyDetails.pageNumber}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={partyDetails.contactNumber}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Typography mt={5}>All Party Details</Typography>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && allPartyDetails.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Party Name</TableCell>
                <TableCell>Page Number</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>Action</TableCell>
                {/* <TableCell>Outstanding</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Slice the array based on current page and rows per page */}
              {allPartyDetails
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((details, index) => (
                  <TableRow key={index}>
                    <TableCell>{details.partyName}</TableCell>
                    <TableCell>{details.pageNumber}</TableCell>
                    <TableCell>{details.contactNumber}</TableCell>
                    <TableCell
                      onClick={() => handleOnRowClickForEdit(details.id)}
                    >
                      Edit
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No party details found.</Typography>
      )}

      {/* Add TablePagination component to control pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={allPartyDetails.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
}
export default PartyDetailsPage;
