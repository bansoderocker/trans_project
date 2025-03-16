import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, logout, signInWithGoogle } from "@/config/firebase";
import { Box, Button, Typography, Avatar } from "@mui/material";

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box>
      {user ? (
        <>
          <Avatar
            src={user.photoURL || ""}
            alt="Profile"
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="body1">Welcome, {user.displayName}</Typography>
          <Button
            onClick={logout}
            variant="contained"
            color="error"
            size="small"
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle} variant="contained" color="primary">
          Sign in with Google
        </Button>
      )}
    </Box>
  );
}
