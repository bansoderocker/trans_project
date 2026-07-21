"use client";

import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import ConstructionIcon from "@mui/icons-material/Construction";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";

export const PageInProgress: React.FC = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <ConstructionIcon sx={{ fontSize: 80, color: "orange", mb: 2 }} />

      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        Page Under Progress
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: "gray" }}>
        This page is currently under development. Please contact the admin for
        more information.
      </Typography>

      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <EmailIcon color="primary" />
          <Link href="mailto:vijuthesolution@gmail.com" underline="hover">
            vijuthesolution@gmail.com
          </Link>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <InstagramIcon sx={{ color: "#E4405F" }} />
          <Link
            href="https://instagram.com/viju_the_solution"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            @viju_the_solution
          </Link>
        </Stack>
      </Stack>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          window.location.href = "mailto:vijuthesolution@gmail.com";
        }}
      >
        Contact Admin
      </Button>
    </Box>
  );
};
