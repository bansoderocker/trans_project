import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  IconButton,
} from "@mui/material";
import { useEffect, useState, FormEvent, useCallback } from "react";
import { db } from "../../config/firebase";
import {
  ref,
  push,
  get,
  remove,
  update,
  DatabaseReference,
} from "firebase/database";
import { Edit, Delete } from "@mui/icons-material";

interface MasterEntry {
  id?: string;
  name: string;
  type: string;
}

interface MasterFormProps {
  uid: string;
  title?: string; // Optional if you want to pass "Master Manager"
}

const masterTypes = [
  { value: "party", label: "Party" },
  { value: "truck", label: "Truck" },
  { value: "location", label: "Location" },
  { value: "expenseType", label: "Expense Type" },
];

function MasterForm({ uid, title = "Master Manager" }: MasterFormProps) {
  const [formData, setFormData] = useState({ name: "", type: "" });
  const [entries, setEntries] = useState<MasterEntry[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [masterRef, setMasterRef] = useState<DatabaseReference>();

  useEffect(() => {
    const refPath = `wallet/${uid}/masters`;
    setMasterRef(ref(db, refPath));
  }, [uid]);

  const fetchEntries = useCallback(async () => {
    try {
      if (masterRef) {
        const snapshot = await get(masterRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setEntries(list);
        }
      }
    } catch (err) {
      console.error("Error fetching master data:", err);
    }
  }, [masterRef]); // include `uid` or anything used inside

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const { name, type } = formData;

    if (!name.trim() || !type) {
      setError("Both name and type are required.");
      return;
    }

    try {
      if (masterRef) {
        if (editId) {
          await update(ref(db, `${masterRef.toString()}/${editId}`), formData);
          setSuccessMessage("Entry updated successfully");
        } else {
          await push(masterRef, formData);
          setSuccessMessage("Entry added successfully");
        }
        setFormData({ name: "", type: "" });
        setEditId(null);
        fetchEntries();
      }
    } catch (e) {
      setError("Error saving entry: " + e);
    }
  };

  const handleEdit = (entry: MasterEntry) => {
    setFormData({ name: entry.name, type: entry.type });
    setEditId(entry.id || null);
  };

  const handleDelete = async (entryId: string) => {
    try {
      const entryRef = ref(db, `wallet/${uid}/masters/${entryId}`);
      await remove(entryRef); // This will remove the entry from the database
      console.log("Entry deleted successfully");
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              SelectProps={{ native: true }}
              fullWidth
              required
            >
              <option value="">Select Type</option>
              {masterTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {editId ? "Update" : "Add"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(entry)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(entry.id!)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default MasterForm;
