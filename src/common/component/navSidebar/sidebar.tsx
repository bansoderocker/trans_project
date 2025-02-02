import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { RightPanel } from "./RightPanel";
import { Box, Typography } from "@mui/material";
import { auth } from "@/config/firebase";
import { getUserData } from "@/common/constant";
import { User } from "firebase/auth";

const navLinks = [
  { name: "Bill", href: "/Expense" },
  { name: "Party", href: "/Party" },
  { name: "Account", href: "/Account" },
  { name: "Truck", href: "/Truck" },
  { name: "Expense", href: "/ExpenseType" },
  { name: "About", href: "/About" },
  { name: "Contact", href: "/Contact" },
];

export default function SideNavBar() {
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [userData, setUserData] = useState<User | null>();

  useEffect(() => {
    if (auth?.currentUser) {
      setUserData(getUserData());
    }
  }, [auth]);

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: 120,
          height: 1000,
          flexShrink: 0,
          display: "flex",
          paddingTop: 10,
          position: "fixed",
          backgroundColor: "gray",
          flexDirection: "column",
          "& .MuiDrawer-paper": {
            width: 140,
            boxSizing: "border-box",
            borderColor: "black",
            backgroundColor: "black", // Set the background color to black
            color: "white",
            textAlign: "center",
            alignItems: "center",
          },
        }}
      >
        <AccountCircleIcon
          sx={{ width: 80, height: 80, marginLeft: "20px", marginTop: "-40px" }}
        />
        <Typography
          sx={{
            width: 80,
            marginLeft: "20px",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          {userData?.displayName}
        </Typography>
        {navLinks.map((link, index) => (
          <Box
            key={index} // Add a unique key for each item
            onClick={() => setSelectedPage(index)}
            sx={{
              cursor: "pointer", // Added a cursor to indicate it's clickable
              padding: "8px",
              marginLeft: "16px",
              backgroundColor: selectedPage === index ? "black" : "gray",
              color: selectedPage === index ? "White" : "black",
            }}
          >
            {link.name}
          </Box>
        ))}
      </Box>
      <Box sx={{ flexGrow: 1, padding: "16px" }}>
        {(() => {
          switch (selectedPage) {
            case 0:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 1:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 2:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 3:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 4:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 5:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            case 6:
              return <RightPanel>Page {selectedPage}</RightPanel>;
            default:
              return <RightPanel>default Page</RightPanel>;
          }
        })()}
      </Box>
    </Box>
  );
}
