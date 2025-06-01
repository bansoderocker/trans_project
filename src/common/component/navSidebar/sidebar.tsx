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
import PartyDetailsPage from "@/pages/party/PartyDetailsPage";
import ExpenseDetailsPage from "@/pages/expense/ExpenseDetailsPage";
import BillEntryPage from "@/pages/billEntry/BillEntryPage";
import MasterForm from "@/pages/master/MasterEntryPage";
import { getUserData } from "@/common/constant/constant";

const navLinks = [
  { name: "Bill Entry", href: "/Account" },
  // { name: "Party", href: "/Party" },
  { name: "Master", href: "/Truck" },
  { name: "Expense", href: "/ExpenseType" },
  { name: "Wallet", href: "/Expense" },
  { name: "About", href: "/About" },
  { name: "Contact", href: "/Contact" },
];

export default function SideNavBar() {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Sidebar open by default on desktop

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
        />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, padding: { xs: "8px", sm: "16px" } }}>
        {(() => {
          switch (selectedPage) {
            case 0:
              return (
                <RightPanel>
                  <BillEntryPage uid={userData?.uid ?? ""} />
                </RightPanel>
              );

            case 1:
              return (
                <RightPanel>
                  <MasterForm uid={userData?.uid ?? ""} />
                </RightPanel>
              );

            case 2:
              return (
                <RightPanel>
                  <ExpenseDetailsPage uid={userData?.uid ?? ""} />
                </RightPanel>
              );
            case 3:
              return <RightPanel>Expense</RightPanel>;
            case 4:
              return <RightPanel>About</RightPanel>;
            case 5:
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
}: {
  userData: User | null;
  handlePageChange: (index: number) => void;
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
      {navLinks.map((link, index) => (
        <Box
          key={index}
          onClick={() => handlePageChange(index)}
          sx={{
            cursor: "pointer",
            padding: "10px",
            textAlign: "center",
            backgroundColor: "Gainsboro",
            "&:hover": { backgroundColor: "lightgray" },
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
