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
import { User } from "firebase/auth";
import { getUserData, walletPageNames } from "@/common/constant/constant";
import { RightPanel } from "./RightPanel";
import { WalletDashboard } from "../dashboard";
import { PageInProgress } from "../../pageInProgress";

export default function SideNavBarWallet() {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Sidebar open by default on desktop

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.warn("No user logged in.");
        return;
      }
      if (user) {
        setUserData(getUserData()); // pass user into your helper
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);
  const handlePageChange = (index: number) => {
    if (selectedPage !== index) {
      setSelectedPage(index);
      setIsMenuOpen(false); // Close sidebar on selection
    }
  };

  // const [selectedData, setSelectedData] = useState<string | number>();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
          vTrans Dashboard 3
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
        variant="temporary"
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
                  <WalletDashboard />
                </RightPanel>
              );
            // case 1:
            //   return (
            //     <RightPanel>
            //       <Transactions
            //         setSelectedPage={setSelectedPage}
            //         setFormData={setSelectedData}
            //       />
            //     </RightPanel>
            //   );
            case 2:
              return (
                <RightPanel>
                  <h1>CASE 2</h1>
                  {/* <AddEditTransaction editFormDataId={selectedData} /> */}
                </RightPanel>
              );

            default:
              return (
                <RightPanel>
                  <PageInProgress />
                </RightPanel>
              );
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
      {walletPageNames.map((link, index) => (
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
