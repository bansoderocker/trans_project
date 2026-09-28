// import {
//   ChangeEvent,
//   FormEvent,
//   useCallback,
//   useEffect,
//   useState,
// } from "react";
// import { push, ref, set, DatabaseReference, get } from "firebase/database";
// import { db } from "../../config/firebase";
// import { Bill, addEditIncomeDetails } from "@/interface/billEntry";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import {
//   Alert,
//   Box,
//   Button,
//   Grid,
//   MenuItem,
//   Paper,
//   TextField,
//   Typography,
// } from "@mui/material";
// import ReactDatePicker from "react-datepicker";
// import { dataBranch } from "@/common/constant/constant";
// import { MasterEntry } from "@/interface";

// export const AddEditBillEntry = ({
//   uid,
//   billDetails,
// }: {
//   uid: string;
//   billDetails?: Bill;
// }) => {
//   const defaultBillDetails = {
//     partyName: "",
//     billNo: "",
//     truckNumber: "",
//     fromLocation: "",
//     toLocation: "",
//     fixedAmount: 0,
//     billAmount: 0,
//     weightCharge: 0,
//     date: new Date().toISOString().split("T")[0],
//     proprietor: "",
//   };

//   const defaultIncomeDetails = {
//     id: 0,
//     IncomeType: "",
//     incomeValue: "",
//   };

//   const [incomeFormData, setIncomeFormData] = useState<addEditIncomeDetails>(
//     defaultIncomeDetails,
//   );

//   const [formData, setFormData] = useState<Bill>(
//     billDetails ?? defaultBillDetails,
//   );

//   useEffect(() => {
//     setSelectedBillId(billDetails?.id);
//   }, [billDetails]);

//   const [selectedBillId, setSelectedBillId] = useState<string | undefined>(
//     undefined,
//   );
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [partyOptions, setPartyOptions] = useState<string[]>([]);
//   const [truckOptions, setTruckOptions] = useState<string[]>([]);
//   const [incomeOptions, setIncomeOptions] = useState<string[]>([]);
//   const [locationOptions, setLocationOptions] = useState<string[]>([]);
//   const [proprietorOptions, setProprietorOptions] = useState<string[]>([]);
//   const [billsRef, setBillsRef] = useState<DatabaseReference | null>(null);
//   const [masterRef, setMasterRef] = useState<DatabaseReference | null>(null);
//   // const [filter, setFilter] = useState<Bill>();
//   const [isFilterApply, setIsFilterApply] = useState<boolean>(false);
//   useEffect(() => {
//     if (db && uid) {
//       const billsReference = ref(db, dataBranch.bill);
//       const masterReference = ref(db, dataBranch.master);
//       setBillsRef(billsReference);
//       setMasterRef(masterReference);
//     }
//   }, [uid]);

//   const fetchMasterOptions = useCallback(async () => {
//     try {
//       if (masterRef) {
//         const snapshot = await get(masterRef);
//         if (snapshot.exists()) {
//           const data = snapshot.val() as Record<string, MasterEntry>;
//           const values = Object.values(data);
//           console.log("values",values)
//           const sortAZ = (values: string[]) =>
//             [...values].sort((a, b) =>
//               a.trim().localeCompare(b.trim(), undefined, {
//                 sensitivity: "base",
//               })
//             );

//           const getOptions = (type: string) =>
//             sortAZ(
//               values
//                 .filter((v) => v.type === type)
//                 .map((v) => v.name)
//             );

//           setPartyOptions(getOptions("party"));
//           setTruckOptions(getOptions("truck"));
//           setLocationOptions(getOptions("location"));
//           setProprietorOptions(getOptions("proprietor"));
//           setIncomeOptions(getOptions("incomeType"));
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }, [masterRef]);

//   useEffect(() => {
//     fetchMasterOptions();
//   }, [uid, fetchMasterOptions]);

//   const handleInputChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         name.includes("Amount") || name === "weightCharge"
//           ? Number(value)
//           : value,
//     }));
//   };
//   const handleIncomeChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = e.target;
//     setIncomeFormData((prev) => ({
//       ...prev,
//       [name]:
//         name.includes("Amount") || name === "weightCharge"
//           ? Number(value)
//           : value,
//     }));
//   };

//   const handleDateChange = (date: Date | null) => {
//     if (date) {
//       setFormData((prev) => ({
//         ...prev,
//         date: date.toLocaleDateString("en-CA"), // Convert to format for input
//       }));
//     }
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMessage(null);
//     try {
//       if (formData.id && db) {
//         // Update existing bill
//         const billRef = ref(db, `${dataBranch.bill}/${selectedBillId}`);
//         await set(billRef, formData);
//         setSuccessMessage("Bill updated successfully!");
//       } else if (billsRef) {
//         // Add new bill

//         await push(billsRef, formData);
//         setSuccessMessage("Bill entry saved!");
//       }

//       setFormData(defaultBillDetails);
//       setSelectedBillId(undefined);
//     } catch (err) {
//       setError("Failed to save bill.");
//       console.log("Error saving bill:", err);
//     }
//   };

//   // const filterData = () => {
//   //   console.log("formData", formData);
//   //   // setFilter(formData);
//   //   setIsFilterApply(true);
//   // };
//   const resetFilterData = () => {
//     console.log("resetFilterData", formData);
//     // setFilter(undefined);
//     setIsFilterApply(false);
//   };

//   const incomeColumns: GridColDef[] = [
//     { field: "IncomeType", headerName: "Name", width: 200 },
//     { field: "incomeValue", headerName: "Description", width: 300 },
//   ];

//   const [incomeRows, setIncomeRows] = useState<addEditIncomeDetails[]>();

//   const updateIncomeList = () => {
//     if (
//       incomeFormData &&
//       incomeFormData.IncomeType &&
//       incomeFormData.incomeValue
//     ) {
//       // setIncomeRows([incomeFormData]);
//       const obj = incomeFormData;
//       obj.id = incomeRows?.length || 0;
//       setIncomeRows((prev) => {
//         const existing = prev ?? [];
//         const alreadyExists = existing.some(
//           (row) => row.IncomeType === obj.IncomeType,
//         );
//         return alreadyExists ? existing : [...existing, obj];
//       });
//       setIncomeFormData(defaultIncomeDetails);
//     }
//   };

//   return (
//     <Box>
//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           {/* Date */}
//           <Box>
//             {/* <TextField
//                 label="Date"
//                 name="date"
//                 type="date"
//                 fullWidth
//                 value={billDetails.date}
//                 onChange={handleInputChange}
//                 InputLabelProps={{ shrink: true }}
//               /> */}
//             <ReactDatePicker
//               selected={new Date(formData.date)} // Convert the date string to a Date object
//               onChange={handleDateChange}
//               dateFormat="dd/MM/yyyy" // Display format
//               popperClassName="datepicker-zindex" // Custom class for z-index
//               customInput={
//                 <TextField
//                   label="Date"
//                   name="date"
//                   fullWidth
//                   required
//                   variant="outlined"
//                 />
//               }
//             />
//           </Box>

//           {/* proprietor Name */}
//           <Box>
//             <TextField
//               select
//               label="Properighter Name"
//               name="proprietor"
//               value={formData.proprietor}
//               onChange={handleInputChange}
//               fullWidth
//             >
//               {proprietorOptions.map((p) => (
//                 <MenuItem key={p} value={p}>
//                   {p}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>
//           {/* Bill No */}
//           <Box>
//             <TextField
//               label="Bill No"
//               name="billNo"
//               value={formData.billNo}
//               onChange={handleInputChange}
//               fullWidth
//             />
//           </Box>
//           {/* Party Name */}
//           <Box>
//             <TextField
//               select
//               label="Party Name"
//               name="partyName"
//               value={formData.partyName}
//               onChange={handleInputChange}
//               fullWidth
//               required
//             >
//               {partyOptions.map((party) => (
//                 <MenuItem key={party} value={party}>
//                   {party}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>

//           {/* Truck Number */}
//           <Box>
//             <TextField
//               select
//               label="Truck Number"
//               name="truckNumber"
//               value={formData.truckNumber}
//               onChange={handleInputChange}
//               fullWidth
//               required
//             >
//               {truckOptions.map((truck) => (
//                 <MenuItem key={truck} value={truck}>
//                   {truck}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>

//           {/* From Location */}
//           <Box>
//             <TextField
//               select
//               label="From"
//               name="fromLocation"
//               value={formData.fromLocation}
//               onChange={handleInputChange}
//               fullWidth
//               required
//             >
//               {locationOptions.map((loc) => (
//                 <MenuItem key={loc} value={loc}>
//                   {loc}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>

//           {/* To Location */}
//           <Box>
//             <TextField
//               select
//               label="To"
//               name="toLocation"
//               value={formData.toLocation}
//               onChange={handleInputChange}
//               fullWidth
//               required
//             >
//               {locationOptions.map((loc) => (
//                 <MenuItem key={loc} value={loc}>
//                   {loc}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>

//           {/* Fixed Amount
//           <Grid item xs={12} md={4}>
//             <TextField
//               label="Fixed Amount"
//               name="fixedAmount"
//               type="number"
//               value={formData.fixedAmount}
//               onChange={handleInputChange}
//               fullWidth
//             />
//                     </Box> */}

//           {/* Bill Amount */}

//           {/* Weight Charge */}
//           {/* <Grid item xs={12} md={4}>
//             <TextField
//               label="Weight Charge"
//               name="weightCharge"
//               type="number"
//               value={formData.weightCharge}
//               onChange={handleInputChange}
//               fullWidth
//             />
//                     </Box> */}
//           {formData.billNo && (
//             <>
//               <Box>
//                 <Typography>Add Income</Typography>
//                 <TextField
//                   select
//                   label="Income Type"
//                   name="IncomeType"
//                   value={incomeFormData.IncomeType}
//                   onChange={handleIncomeChange}
//                   fullWidth
//                   required
//                 >
//                   {incomeOptions.map((ex) => (
//                     <MenuItem key={ex} value={ex}>
//                       {ex}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Box>
//               <Box>
//                 <TextField
//                   label="Value"
//                   name="incomeValue"
//                   type="number"
//                   value={incomeFormData.incomeValue}
//                   onChange={handleIncomeChange}
//                   fullWidth
//                 />
//               </Box>
//               <Box>
//                 <Button variant="contained" onClick={updateIncomeList}>
//                   Add Income
//                 </Button>
//               </Box>
//               <Box>
//                 <Typography>View Income</Typography>
//                 <Paper sx={{ height: 400, width: "100%" }}>
//                   <DataGrid
//                     rows={incomeRows}
//                     columns={incomeColumns}
//                     pageSizeOptions={[5, 10]}
//                     sx={{ border: 1 }}
//                   />
//                 </Paper>{" "}
//               </Box>
//             </>
//           )}
//           <Box> </Box>
//           <Box>
//             <Button variant="contained" type="submit">
//               {selectedBillId ? "Update Bill" : "Save"}
//             </Button>
//           </Box>

//           {/* <Grid item xs={1}>
//             <Button variant="contained" onClick={filterData}>
//               {"Search"}
//             </Button>
//                     </Box> */}

//           {isFilterApply && (
//             <Box>
//               <Button variant="contained" onClick={resetFilterData}>
//                 {"reset"}
//               </Button>
//             </Box>
//           )}
//           {error && (
//             <Box>
//               <Alert severity="error">{error}</Alert>
//             </Box>
//           )}
//           {successMessage && (
//             <Box>
//               <Alert severity="success">{successMessage}</Alert>
//             </Box>
//           )}
//         </Grid>
//       </form>
//     </Box>
//   );
// };

// export default AddEditBillEntry;
