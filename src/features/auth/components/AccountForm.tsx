// features/auth/components/AccountForm.tsx
import AppInput from "../../../components/common/Input/AppInput";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AccountForm({ onSubmit }: { onSubmit: () => void }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>

      {/* Left Side */}
      <Box sx={{
        width: "50%",
        background: "#528C91",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "40px",
      }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px", alignSelf: "center", marginLeft: "30px" }}>
          <img src="/src/assets/logo.png" alt="Whisper AI" style={{ width: "80px" }} />
          <Box>
            <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "30px" }}>
              Whisper ai.
            </Typography>
            <Typography sx={{ color: "white", fontSize: "12px" }}>
              Smart Care. Simple Access
            </Typography>
          </Box>
        </Box>

        {/* Doctor Image */}
       <img
            src="/src/assets/Banner/banner.png"
            alt="Doctor"
            style={{ 
            width: "70%",
            height: "60%",
            objectFit: "contain",
            marginLeft: "40px",
            marginBottom: "30px"
            }}
        />

        {/* Copyright */}
        <Typography sx={{ color: "white", fontSize: "12px" }}>
          © 2025 Whisper ai. All rights reserved.
        </Typography>
      </Box>

      {/* Right Side */}
      <Box sx={{
        width: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}>
        <Box sx={{ width: "380px" }}>

          {/* Title */}
          <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "8px" }}>
            Account Details
          </Typography>

          {/* Subtitle */}
          <Typography sx={{ fontSize: "14px", color: "#666", marginBottom: "32px" }}>
            We just need some more details before we can get you started
          </Typography>

          {/* Full Name Input */}
          <Typography sx={{ fontSize: "14px", marginBottom: "8px" }}>
            Enter your full name*
          </Typography>
          <AppInput placeholder="Your full name" fullWidth />

          {/* Email Input */}
          <Typography sx={{ fontSize: "14px", marginTop: "24px", marginBottom: "8px" }}>
            Enter your email ID*
          </Typography>
          <AppInput placeholder="Email ID" fullWidth />

          {/* Save Button */}
          <Button
          onClick={onSubmit}   
          variant="contained"
          fullWidth
          sx={{
            marginTop: "32px",
            backgroundColor: "#0d9488",
           "&:hover": { backgroundColor: "#0f766e" },
            padding: "12px",
           }}
          >
            Save account details
          </Button>

        </Box>
      </Box>

    </Box>
  );
}