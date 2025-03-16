import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export const RightPanel: React.FC<RightPanelProps> = ({ children }) => {
  return (
    <Box
      sx={{
        // width: "100%",
        display: "flex",
        // justifyContent: "center", // Centers content horizontally
        alignItems: "center", // Centers content vertically if needed
        // minHeight: "100vh", // Optional: makes sure it takes full height
      }}
    >
      <Typography sx={{ background: "black", color: "white" }}></Typography>
      {children}
    </Box>
  );
};
