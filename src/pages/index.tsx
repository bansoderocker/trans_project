import Head from "next/head";
import SideNavBar from "@/common/component/navSidebar/sidebar";
import { auth, db } from "@/config/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import LoginButton from "./auth/LoginButton";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { ref, set } from "firebase/database";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const { LocalStorage } = require("node-localstorage");
  // const localStorage = new LocalStorage("./scratch"); // path where data is stored

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // ✅ Only set loading to false after auth state is known
    });

    return () => unsubscribe(); // ✅ Clean up listener properly
  }, []);

  useEffect(() => {
    if (user !== null && user !== undefined) {
      const userLogRef = ref(db, `wallet/user/${user?.uid}`);
      const requiredData = {
        uid: user.uid,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        email: user.email,
      };

      // localStorage.setItem("token", "abc123");

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
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      ) : user != null && user ? (
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
