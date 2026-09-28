import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  Avatar,
} from "@mui/material";
import { auth, logout } from "@/config/firebase";
import MasterForm from "@/pages/master/MasterEntryPage";
import { getUserData } from "@/common/constant/constant";
import { User } from "firebase/auth";
import { RightPanel } from "./RightPanel";
import BillEntryPage from "@/pages/billEntry/_billEntryPage";
import BillEntryList from "@/pages/billEntry/billEntryList";
import BankTransactionList from "@/common/component/wallet/bankTransactions/BankTransactionList";
import IncomeDetailsPage from "@/pages/income/IncomeDetailsPage";
import { WalletDashboard } from "@/common/component/wallet/dashboard";

const pageNames = [
  { name: "Bill" },
  { name: "Daily Entry" },
  { name: "Master" },
  { name: "Income" },
  { name: "Wallet" },
  { name: "About" },
  { name: "Contact" },
  { name: "Bank Transactions" },
];

export default function SideNavBar() {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const openBillEditor = (billId?: string) => {
    setEditingBillId(billId ?? null);
    setSelectedPage(0); // BillEntryPage
  };

  // 🔧 Fixed: only call getUserData when user exists
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserData(getUserData());
      } else {
        setUserData(null);
        console.warn("No user logged in.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePageChange = (index: number) => {
    if (selectedPage !== index) {
      setSelectedPage(index);
    }
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case 0:
        return (
          <RightPanel>
            <BillEntryPage
              billId={editingBillId}
              onBack={() => {
                setEditingBillId(null);
                setSelectedPage(1);
              }}
            />
          </RightPanel>
        );
      case 1:
        return (
          <RightPanel>
            <BillEntryList
              onEdit={openBillEditor}
              onAdd={() => openBillEditor()}
            />
          </RightPanel>
        );
      case 2:
        return (
          <RightPanel>
            <MasterForm uid={userData?.uid ?? ""} />
          </RightPanel>
        );
      case 3:
        return (
          <RightPanel>
            <IncomeDetailsPage uid={userData?.uid ?? ""} />
          </RightPanel>
        );
      case 4:
        return (
          <RightPanel>
            <WalletDashboard />
          </RightPanel>
        );
      case 5:
        return <RightPanel>About</RightPanel>;
      case 6:
        return <RightPanel>Contact</RightPanel>;
      case 7:
        return (
          <RightPanel>
            <BankTransactionList />
          </RightPanel>
        );
      case 8:
        return (
          <RightPanel>
            <BankTransactionList openAddOnMount />
          </RightPanel>
        );
      default:
        return <RightPanel>Default Page</RightPanel>;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "black",
          color: "white",
          padding: "10px 20px",
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          sx={{ color: "white" }}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          vTrans Dashboard
        </Typography>
      </Box>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "80%", sm: "250px" },
            paddingTop: "20px",
          },
        }}
      >
        <SidebarContent
          userData={userData}
          handlePageChange={handlePageChange}
          selectedPage={selectedPage}
        />
      </Drawer>

      {/* Main Page Content */}
      <Box sx={{ flexGrow: 1, padding: { xs: "8px", sm: "16px" } }}>
        {renderPage()}
      </Box>
    </Box>
  );
}

// 🧩 Sidebar Content
const SidebarContent = ({
  userData,
  handlePageChange,
  selectedPage,
}: {
  userData: User | null;
  handlePageChange: (index: number) => void;
  selectedPage: number;
}) => {
  return (
    <Box sx={{ textAlign: "center", width: "100%", paddingX: 2 }}>
      {/* Profile */}
      <Avatar
        src={userData?.photoURL || "https://via.placeholder.com/50"}
        alt="Profile"
        sx={{
          width: 60,
          height: 60,
          margin: "10px auto",
          border: "2px solid white",
          boxShadow: 2,
        }}
      />
      <Typography sx={{ fontWeight: "bold", marginBottom: "10px" }}>
        {userData?.displayName || "Guest User"}
      </Typography>

      {/* Navigation */}
      {pageNames.map((link, index) => (
        <Box
          key={index}
          onClick={() => handlePageChange(index)}
          sx={{
            cursor: "pointer",
            padding: "10px",
            backgroundColor: selectedPage === index ? "gray" : "Gainsboro",
            color: selectedPage === index ? "white" : "text.primary",
            "&:hover": {
              backgroundColor: "lightgray",
              color: "black",
            },
            borderRadius: "4px",
            marginBottom: "5px",
          }}
        >
          <Typography>{link.name}</Typography>
        </Box>
      ))}

      {/* Logout */}
      <Button
        onClick={logout}
        variant="contained"
        color="error"
        startIcon={<LogoutIcon />}
        fullWidth
        sx={{ marginTop: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};
