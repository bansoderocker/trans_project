import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { ref, set } from "firebase/database";
import LoginButton from "../auth/LoginButton";
import { auth, db } from "@/config/firebase";
import SideNavBarWallet from "@/common/component/wallet/navSidebarWallet/SideNavBarWallet";
import { dataBranch } from "@/common/constant/constant";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // ✅ Only set loading to false after auth state is known
    });

    return () => unsubscribe(); // ✅ Clean up listener properly
  }, []);

  useEffect(() => {
    if (user !== null && user !== undefined) {
      const userLogRef = ref(db, `${dataBranch.user}/${user?.uid}`);
      const requiredData = {
        uid: user.uid,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        email: user.email,
      };

      user?.getIdToken(true).then((x) => localStorage.setItem("token", x));

      set(userLogRef, requiredData);
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>Trans App</title>
        <meta name="description" content="Trans app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      ) : user != null && user ? (
        <SideNavBarWallet />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper elevation={4} sx={{ p: 4, width: 400, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Wallet App
            </Typography>
            <LoginButton />
          </Paper>
        </Box>
      )}
    </>
  );
}
