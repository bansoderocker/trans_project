import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { RightPanel } from "./RightPanel";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  Avatar,
} from "@mui/material";
import { auth, logout } from "@/config/firebase";
import { User } from "firebase/auth";
import ExpenseDetailsPage from "@/pages/expense/ExpenseDetailsPage";
import BillEntryPage from "@/pages/billEntry/BillEntryPage";
import MasterForm from "@/pages/master/MasterEntryPage";
import { getUserData } from "@/common/constant/constant";
import BillEntryListTable from "../dailyEntry";

const pageNames = [
  // { name: "Dashboard" },
  { name: "Bill" },
  { name: "Daily Entry" },
  { name: "Master" },
  { name: "Expense" },
  { name: "Wallet" },
  { name: "About" },
  { name: "Contact" },
];

export default function SideNavBar() {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Sidebar open by default on desktop

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.warn("No user logged in.");
        return;
      }
      setUserData(user ? getUserData() : null);
    });
    return () => unsubscribe();
  }, []);
  const handlePageChange = (index: number) => {
    if (selectedPage !== index) {
      setSelectedPage(index);
      setIsMenuOpen(false); // Close sidebar on selection
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Title Bar with Menu Icon */}
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
          <MenuIcon fontSize="large" />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          vTrans Dashboard
        </Typography>
      </Box>

      {/* Sidebar - Responsive */}
      <Drawer
        anchor="left"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%", // Adjust width for mobile
            maxWidth: "250px", // Prevent too much width
            marginTop: 0, // Remove extra margin
          },
        }}
        variant="persistent"
      >
        <IconButton
          onClick={() => setIsMenuOpen(false)}
          sx={{ alignSelf: "flex-end", margin: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <SidebarContent
          userData={userData}
          handlePageChange={handlePageChange}
          selectedPage={selectedPage}
        />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, padding: { xs: "8px", sm: "16px" } }}>
        {(() => {
          switch (selectedPage) {
            case 0:
              return (
                <RightPanel>
                  <BillEntryListTable />
                </RightPanel>
              );
              break;
            case 1:
              return (
                <RightPanel>
                  <BillEntryPage uid={userData?.uid ?? ""} />
                </RightPanel>
              );
              break;
            // case 1:
            //   return (
            //     <RightPanel>
            //       <PartyDetailsPage />
            //     </RightPanel>
            //   );
            case 2:
              return (
                <RightPanel>
                  <MasterForm uid={userData?.uid ?? ""} />
                </RightPanel>
              );

            case 3:
              return (
                <RightPanel>
                  <ExpenseDetailsPage uid={userData?.uid ?? ""} />
                </RightPanel>
              );
            case 4:
              return <RightPanel>Expense</RightPanel>;
            case 5:
              return <RightPanel>About</RightPanel>;
            case 6:
              return <RightPanel>Contact</RightPanel>;
            default:
              return <RightPanel>Default Page</RightPanel>;
          }
        })()}
      </Box>
    </Box>
  );
}

// Sidebar Content Component
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
      {/* Profile Section */}
      <Avatar
        src={userData?.photoURL || "https://via.placeholder.com/50"} // Default image
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

      {/* Navigation Links */}
      {pageNames.map((link, index) => (
        <Box
          key={index}
          onClick={() => handlePageChange(index)}
          sx={{
            cursor: "pointer",
            padding: "10px",
            textAlign: "center",
            backgroundColor: selectedPage === index ? "gray" : "Gainsboro",
            color: selectedPage === index ? "white" : "text.primary",
            "&:hover": { backgroundColor: "lightgray", color: "black" },
          }}
        >
          <Typography>{link.name}</Typography>
        </Box>
      ))}

      {/* Logout Button with Icon */}
      <Button
        onClick={logout}
        variant="contained"
        color="error"
        startIcon={<LogoutIcon />}
        fullWidth
        sx={{ marginBottom: 2, marginTop: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};
