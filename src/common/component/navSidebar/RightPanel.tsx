import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export const RightPanel: React.FC<RightPanelProps> = ({ children }) => {
  return (
    <Box sx={{ width: "100%", paddingLeft: 20 }}>
      <Typography sx={{ background: "black", color: "white" }}></Typography>
      {children}
    </Box>
  );
};
