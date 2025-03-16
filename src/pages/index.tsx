import Head from "next/head";
import SideNavBar from "@/common/component/navSidebar/sidebar";
import { auth } from "@/config/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import LoginButton from "./auth/LoginButton";
import { Box, Paper, Typography } from "@mui/material";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>Trans App</title>
        <meta name="description" content="Trans app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {user != null && user ? (
        <SideNavBar />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Paper elevation={4} sx={{ p: 4, width: 400, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Trans App
            </Typography>
            <LoginButton />
          </Paper>
        </Box>
      )}
    </>
  );
}
