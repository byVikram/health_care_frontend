// features/auth/components/OtpVerified.tsx
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function OtpVerified() {
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
        <Box sx={{ width: "380px", textAlign: "center" }}>

          {/* Success Icon */}
          <Box sx={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "#e6f7f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px auto",
          }}>
            <CheckCircleIcon sx={{ fontSize: "52px", color: "#0d9488" }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "12px" }}>
            OTP Verified!
          </Typography>

          {/* Subtitle */}
          <Typography sx={{ fontSize: "14px", color: "#666", marginBottom: "32px" }}>
            Your phone number has been verified successfully.
          </Typography>

          {/* Continue Button */}
          <Button
            onClick={() => navigate("/dashboard")}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#0d9488",
              "&:hover": { backgroundColor: "#0f766e" },
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "15px",
            }}
          >
            Continue
          </Button>

        </Box>
      </Box>

    </Box>
  );
}