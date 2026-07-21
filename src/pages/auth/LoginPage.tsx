"use client";

import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFirebaseAuth } from "@/hook/auth/useFirebaseAuth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);

  const req = {
    email,
    password,
    userName: "", // not needed for login, but required by type
  };
  const message = useFirebaseAuth(req, true, isSubmit);

  console.log("message", message);

  const handleLogin = () => {
    // TODO: Replace with real authentication
    if (email && password) {
      setIsSubmit(true);

      console.log("Logging in:", { email, password });
      // router.push("/index"); // redirect after login
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #eef2f3, #dfe9f3)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 420,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          TMS Login
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Sign in to continue
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Button size="small" onClick={() => router.push("/")}>
          Contact Admin
        </Button>
      </Paper>
    </Box>
  );
}
