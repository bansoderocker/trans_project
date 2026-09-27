import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { onValue, ref, update } from "firebase/database";

import { db } from "@/config/firebase";
import {
  dataBranch,
  getUserData,
  MasterType,
} from "@/common/constant/constant";
import { useMasterData } from "@/hook/useMasterData";
import { MasterEntry } from "@/interface";

import {
  Skeleton,
  Button,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User } from "firebase/auth";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import UpdatePaymentDialog from "./UpdatePaymentDialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
interface Props {
  onEdit: (id: string) => void;
  onAdd: () => void;
}

export default function BillEntryList({ onEdit, onAdd }: Props) {
  const { entries } = useMasterData();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const userData: User | null = getUserData();

  // ---------------------------------------------------------
  // Master Lists
  // ---------------------------------------------------------

  const lstProprietor = useMemo(
    () =>
      entries.filter(
        (x: MasterEntry) => x.type === MasterType.Proprietor
      ),
    [entries]
  );

  const lstParty = useMemo(
    () =>
      entries.filter(
        (x: MasterEntry) => x.type === MasterType.Party
      ),
    [entries]
  );

  const lstTruck = useMemo(
    () =>
      entries.filter(
        (x: MasterEntry) => x.type === MasterType.Truck
      ),
    [entries]
  );

  const lstLocation = useMemo(
    () =>
      entries.filter(
        (x: MasterEntry) => x.type === MasterType.Location
      ),
    [entries]
  );

  // ---------------------------------------------------------
  // Lookup Maps
  // ---------------------------------------------------------

  const proprietorMap = useMemo(
    () =>
      Object.fromEntries(
        lstProprietor.map((x) => [x.id, x.name])
      ),
    [lstProprietor]
  );

  const partyMap = useMemo(
    () =>
      Object.fromEntries(
        lstParty.map((x) => [x.id, x.name])
      ),
    [lstParty]
  );

  const truckMap = useMemo(
    () =>
      Object.fromEntries(
        lstTruck.map((x) => [x.id, x.name])
      ),
    [lstTruck]
  );

  const locationMap = useMemo(
    () =>
      Object.fromEntries(
        lstLocation.map((x) => [x.id, x.name])
      ),
    [lstLocation]
  );

  // ---------------------------------------------------------
  // Load Bills
  // ---------------------------------------------------------

  useEffect(() => {
    setLoading(true);

    const billsRef = ref(db, dataBranch.bill);

    const unsubscribe = onValue(
      billsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRows([]);
          setLoading(false);
          return;
        }

        const data = Object.entries(snapshot.val()).flatMap(
          ([id, value]: any) => {
            const particulars = value.particular ?? [];

            return particulars.map(
              (p: any, index: number) => {
                const grandTotal =
                  (p.expenses ?? []).reduce(
                    (
                      total: number,
                      expense: any
                    ) =>
                      total +
                      (Number(expense.amount) || 0),
                    0
                  ) ?? 0;

                return {
                  id: `${id}_${index}`,
                  recordId: id,

                  billNo: value.billNo,
                  date: value.date,

                  party: value.party,
                  proprietor: value.proprietor,

                  particularDate:
                    p.particularDate ?? "",

                  vehicleNo:
                    p.vehicleNo ?? "",

                  fromLocation:
                    p.fromLocation ?? "",

                  toLocation:
                    p.toLocation ?? "",

                  grandTotal,

                  paymentAmount:
                    p.payment?.amount ?? 0,

                  paymentRemark:
                    p.payment?.remark ?? "",

                  isFullySettled:
                    p.payment?.isFullySettled ?? false,

                  paymentDate:
                    p.payment?.paymentDate ?? "",

                  isTrash:
                    value.isTrash ?? false,

                  particularIndex: index,
                };
              }
            );
          }
        );

        setRows(
          data.filter(
            (f) => !f?.isTrash
          )
        );

        setLoading(false);
      },
      (error) => {
        console.error(error);

        setRows([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------
  // Columns
  // ---------------------------------------------------------

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,

      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                onEdit(params.row.recordId)
              }
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              color="error"
              size="small"
              onClick={() =>
                handleDelete(params.row.recordId)
              }
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },

    {
      field: "proprietor",
      headerName: "Proprietor",
      width: 180,

      valueGetter: (_, row) =>
        proprietorMap[row.proprietor] ??
        row.proprietor,
    },

    {
      field: "party",
      headerName: "Party",
      width: 180,

      valueGetter: (_, row) =>
        partyMap[row.party] ??
        row.party,
    },

    {
      field: "billNo",
      headerName: "Bill No",
      width: 100,
    },

    {
      field: "date",
      headerName: "Bill Date",
      width: 120,
    },

    {
      field: "particularDate",
      headerName: "Trip Date",
      width: 120,
    },

    {
      field: "vehicleNo",
      headerName: "Truck",
      width: 170,

      valueGetter: (_, row) =>
        truckMap[row.vehicleNo] ??
        row.vehicleNo,
    },

    {
      field: "fromLocation",
      headerName: "From",
      width: 180,

      valueGetter: (_, row) =>
        locationMap[row.fromLocation] ??
        row.fromLocation,
    },

    {
      field: "toLocation",
      headerName: "To",
      width: 180,

      valueGetter: (_, row) =>
        locationMap[row.toLocation] ??
        row.toLocation,
    },

    {
      field: "grandTotal",
      headerName: "Grand Total",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",

      valueFormatter: (value) =>
        Number(value).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ),
    },

    {
      field: "paymentAmount",
      headerName: "Payment",
      width: 120,
      type: "number",
    },

    {
      field: "paymentRemark",
      headerName: "Remark",
      width: 200,
    },

    {
      field: "isFullySettled",
      headerName: "Settled",
      width: 110,

      renderCell: (params) =>
        params.value ? "Yes" : "No",
    },
  ];

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) {
      return rows;
    }

    const search =
      searchText.toLowerCase();

    return rows.filter((row) => {
      const party = (
        partyMap[row.party] ?? ""
      ).toLowerCase();

      const proprietor = (
        proprietorMap[row.proprietor] ?? ""
      ).toLowerCase();

      const truck = (
        truckMap[row.vehicleNo] ?? ""
      ).toLowerCase();

      const from = (
        locationMap[row.fromLocation] ?? ""
      ).toLowerCase();

      const to = (
        locationMap[row.toLocation] ?? ""
      ).toLowerCase();

      return (
        String(row.billNo)
          .toLowerCase()
          .includes(search) ||

        String(row.date)
          .toLowerCase()
          .includes(search) ||

        party.includes(search) ||

        proprietor.includes(search) ||

        truck.includes(search) ||

        from.includes(search) ||

        to.includes(search)
      );
    });
  }, [
    rows,
    searchText,
    partyMap,
    proprietorMap,
    truckMap,
    locationMap,
  ]);

  // ---------------------------------------------------------
  // Row Selection
  // ---------------------------------------------------------

  const [
    rowSelectionModel,
    setRowSelectionModel,
  ] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [
    selectedRows,
    setSelectedRows,
  ] = useState<string[]>([]);

  // ---------------------------------------------------------
  // IMPORTANT:
  // Get selected rows correctly for BOTH:
  //
  // type = include
  // type = exclude (Select All)
  // ---------------------------------------------------------

  const getSelectedBillRows = () => {
    const ids = rowSelectionModel.ids;

    if (rowSelectionModel.type === "include") {
      return rows.filter((row) =>
        ids.has(row.id)
      );
    }

    // MUI "exclude" selection model means:
    // ALL rows are selected except IDs in the Set

    return rows.filter(
      (row) => !ids.has(row.id)
    );
  };

  // ---------------------------------------------------------
  // Delete
  // ---------------------------------------------------------

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this bill?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await update(
        ref(
          db,
          `${dataBranch.bill}/${id}`
        ),
        {
          isTrash: true,
          modifiedBy:
            userData?.uid ?? null,
          modifiedDate:
            new Date().toISOString(),
        }
      );

      toast.warning(
        "Bill deleted successfully."
      );
    } catch (error) {
      console.error(error);

      toast.warning(
        "Failed to delete bill."
      );
    }
  };

  // ---------------------------------------------------------
  // Update Payment
  // ---------------------------------------------------------

  const [
    paymentOpen,
    setPaymentOpen,
  ] = useState(false);

  const [
    savingPayment,
    setSavingPayment,
  ] = useState(false);

  const handleUpdatePayment = async (
    amount: number,
    remark: string,
    isFullySettled: boolean
  ) => {
    setSavingPayment(true);

    try {
      const selectedBillRows =
        getSelectedBillRows();

      await Promise.all(
        selectedBillRows.map(
          async (row) => {
            const payment = {
              amount,
              remark,
              isFullySettled,

              paymentDate:
                new Date().toISOString(),

              createdBy:
                userData?.uid,

              createdDate:
                new Date().toISOString(),
            };

            const paymentRef =
              ref(
                db,
                `${dataBranch.bill}/${row.recordId}/particular/${row.particularIndex}`
              );

            await update(
              paymentRef,
              {
                payment,
                isFullySettled,
              }
            );
          }
        )
      );

      setPaymentOpen(false);
      setSelectedRows([]);

      // Clear selection
      setRowSelectionModel({
        type: "include",
        ids: new Set(),
      });

      toast.success(
        "Payment updated successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update payment."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  // ---------------------------------------------------------
  // Open Payment Dialog
  // ---------------------------------------------------------

  const handleOpenPaymentDialog =
    () => {
      const selectedBillRows =
        getSelectedBillRows();

      if (
        selectedBillRows.length === 0
      ) {
        toast.warning(
          "Please select at least one record."
        );

        return;
      }

      // Same party validation

      const uniqueParties = [
        ...new Set(
          selectedBillRows.map(
            (r) => r.party
          )
        ),
      ];

      if (
        uniqueParties.length > 1
      ) {
        toast.warning(
          "Please select records belonging to only one party."
        );

        return;
      }

      // Validation for multiple selection

      if (
        selectedBillRows.length > 1
      ) {
        const firstRow =
          selectedBillRows[0];

        const firstIsPaid =
          !!firstRow.paymentAmount ||
          !!firstRow.paymentRemark ||
          !!firstRow.paymentDate;

        if (!firstIsPaid) {
          // All must be unpaid

          const hasPaidRow =
            selectedBillRows.some(
              (r) =>
                !!r.paymentAmount ||
                !!r.paymentRemark ||
                !!r.paymentDate
            );

          if (hasPaidRow) {
            toast.warning(
              "Please select either all unpaid records or records with the same payment."
            );

            return;
          }
        } else {
          // All must have identical payment details

          const isSamePayment =
            selectedBillRows.every(
              (r) =>
                r.paymentAmount ===
                  firstRow.paymentAmount &&
                r.paymentRemark ===
                  firstRow.paymentRemark &&
                r.paymentDate ===
                  firstRow.paymentDate
            );

          if (!isSamePayment) {
            toast.warning(
              "Please select records having the same payment details."
            );

            return;
          }
        }
      }

      setSelectedRows(
        selectedBillRows.map(
          (row) => row.id
        )
      );

      setPaymentOpen(true);
    };

  // ---------------------------------------------------------
  // Export Excel
  // ---------------------------------------------------------

  const handleExportExcel = () => {
    const selectedBillRows =
      getSelectedBillRows();

    if (
      selectedBillRows.length === 0
    ) {
      toast.warning(
        "Please select at least one record."
      );

      return;
    }

    // ------------------------------------------
    // Validate one Party
    // ------------------------------------------

    const uniqueParties = [
      ...new Set(
        selectedBillRows.map(
          (r) => r.party
        )
      ),
    ];

    if (
      uniqueParties.length > 1
    ) {
      toast.warning(
        "Please select records belonging to only one party for Excel export."
      );

      return;
    }

    // ------------------------------------------
    // Validate one Proprietor
    // ------------------------------------------

    const uniqueProprietors = [
      ...new Set(
        selectedBillRows.map(
          (r) => r.proprietor
        )
      ),
    ];

    if (
      uniqueProprietors.length > 1
    ) {
      toast.warning(
        "Please select records belonging to only one proprietor for Excel export."
      );

      return;
    }

    const firstRow =
      selectedBillRows[0];

    const proprietorName =
      proprietorMap[
        firstRow.proprietor
      ] ??
      firstRow.proprietor ??
      "";

    const partyName =
      partyMap[firstRow.party] ??
      firstRow.party ??
      "";

    // ------------------------------------------
    // Excel detail rows
    // ------------------------------------------

    const excelRows =
      selectedBillRows.map(
        (row, index) => ({
          "Sr. No.": index + 1,

          "Bill No":
            row.billNo ?? "",

          "Bill Date":
            row.date ?? "",

          "Trip Date":
            row.particularDate ?? "",

          Truck:
            truckMap[
              row.vehicleNo
            ] ??
            row.vehicleNo ??
            "",

          From:
            locationMap[
              row.fromLocation
            ] ??
            row.fromLocation ??
            "",

          To:
            locationMap[
              row.toLocation
            ] ??
            row.toLocation ??
            "",

          "Grand Total":
            Number(
              row.grandTotal
            ) || 0,

          Payment:
            Number(
              row.paymentAmount
            ) || 0,

          Remark:
            row.paymentRemark ??
            "",

          Settled:
            row.isFullySettled
              ? "Yes"
              : "No",
        })
      );

    // ------------------------------------------
    // Totals
    // ------------------------------------------

    const grandTotal =
      selectedBillRows.reduce(
        (total, row) =>
          total +
          (Number(
            row.grandTotal
          ) || 0),
        0
      );

    const paymentTotal =
      selectedBillRows.reduce(
        (total, row) =>
          total +
          (Number(
            row.paymentAmount
          ) || 0),
        0
      );

    const balance =
      grandTotal - paymentTotal;

    // ------------------------------------------
    // Excel Sheet
    // ------------------------------------------

    const sheetData: any[][] = [
      [
        "TRANSPORT BILL STATEMENT",
      ],

      [],

      [
        "Proprietor",
        proprietorName,
      ],

      [
        "Party",
        partyName,
      ],

      [],

      [
        "Sr. No.",
        "Bill No",
        "Bill Date",
        "Trip Date",
        "Truck",
        "From",
        "To",
        "Grand Total",
        "Payment",
        "Remark",
        "Settled",
      ],

      ...excelRows.map((row) =>
        Object.values(row)
      ),

      [],

      [
        "",
        "",
        "",
        "",
        "",
        "",
        "TOTAL",
        grandTotal,
        paymentTotal,
        "",
        "",
      ],

      [
        "",
        "",
        "",
        "",
        "",
        "",
        "BALANCE",
        balance,
        "",
        "",
        "",
      ],
    ];

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        sheetData
      );

    // ------------------------------------------
    // Merge Header
    // ------------------------------------------

    worksheet["!merges"] = [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 10,
        },
      },

      {
        s: {
          r: 2,
          c: 1,
        },
        e: {
          r: 2,
          c: 10,
        },
      },

      {
        s: {
          r: 3,
          c: 1,
        },
        e: {
          r: 3,
          c: 10,
        },
      },
    ];

    // ------------------------------------------
    // Column Widths
    // ------------------------------------------

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 25 },
      { wch: 12 },
    ];

    // ------------------------------------------
    // Number Formatting
    // ------------------------------------------

    const dataStartRow = 6;

    const dataEndRow =
      dataStartRow +
      excelRows.length -
      1;

    for (
      let row = dataStartRow;
      row <= dataEndRow;
      row++
    ) {
      const excelRow =
        row + 1;

      if (
        worksheet[
          `H${excelRow}`
        ]
      ) {
        worksheet[
          `H${excelRow}`
        ].z = "#,##0.00";
      }

      if (
        worksheet[
          `I${excelRow}`
        ]
      ) {
        worksheet[
          `I${excelRow}`
        ].z = "#,##0.00";
      }
    }

    // ------------------------------------------
    // Create Workbook
    // ------------------------------------------

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bill Statement"
    );

    // ------------------------------------------
    // File Name
    // ------------------------------------------

    const safePartyName =
      String(partyName)
        .replace(
          /[^a-zA-Z0-9-_ ]/g,
          ""
        )
        .trim()
        .replace(
          /\s+/g,
          "_"
        );

    const fileName =
      `${safePartyName || "Party"}_Bill_Statement.xlsx`;

    XLSX.writeFile(
      workbook,
      fileName
    );

    toast.success(
      "Excel exported successfully."
    );
  };

  // ---------------------------------------------------------
  // Selected rows for Dialog
  // ---------------------------------------------------------

  const selectedBillRows =
    useMemo(() => {
      if (
        rowSelectionModel.type ===
        "include"
      ) {
        return rows.filter((row) =>
          rowSelectionModel.ids.has(
            row.id
          )
        );
      }

      return rows.filter(
        (row) =>
          !rowSelectionModel.ids.has(
            row.id
          )
      );
    }, [
      rowSelectionModel,
      rows,
    ]);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div
      style={{
        height: 650,
        width: "100%",
      }}
    >
      {/* Toolbar */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <TextField
          size="small"
          label="Search Bill / Party / Truck / From / To"
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
          sx={{
            width: 350,
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {/* Add Bill */}

          <Button
            variant="contained"
            onClick={onAdd}
          >
            Add Bill
          </Button>

          {/* Update Payment */}

          <Button
            variant="contained"
            color="success"
            disabled={
              selectedBillRows.length ===
              0
            }
            onClick={
              handleOpenPaymentDialog
            }
          >
            Update Payment (
            {selectedBillRows.length}
            )
          </Button>

          {/* Export Excel */}

          <Button
            variant="contained"
            color="primary"
            disabled={
              selectedBillRows.length ===
              0
            }
            onClick={
              handleExportExcel
            }
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Grid */}

      {loading ? (
        <>
          <Skeleton
            variant="rounded"
            height={56}
            sx={{
              mb: 1,
            }}
          />

          {Array.from({
            length: 10,
          }).map(
            (_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={48}
                sx={{
                  mb: 1,
                }}
              />
            )
          )}
        </>
      ) : (
        <DataGrid
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={
            rowSelectionModel
          }
          onRowSelectionModelChange={(
            newSelection
          ) => {
            setRowSelectionModel(
              newSelection
            );
          }}
          getRowId={(row) =>
            row.id
          }
          pageSizeOptions={[
            10,
            25,
            50,
            100,
          ]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
        />
      )}

      {/* Payment Dialog */}

      <UpdatePaymentDialog
        open={paymentOpen}
        loading={savingPayment}
        selectedRows={
          selectedBillRows
        }
        onClose={() =>
          setPaymentOpen(false)
        }
        onSave={
          handleUpdatePayment
        }
      />
    </div>
  );
}