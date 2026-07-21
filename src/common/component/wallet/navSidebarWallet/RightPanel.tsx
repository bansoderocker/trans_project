import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export const RightPanel: React.FC<RightPanelProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // full height of parent
        width: "100%", // full width of parent
      }}
    >
      <Typography sx={{ background: "black", color: "white" }}></Typography>
      {children}
    </Box>
  );
};
