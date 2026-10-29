// components/common/NotFoundPage.tsx
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useHomePath } from "../../hooks/useGoBack";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const home = useHomePath();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
      <Typography variant="h2">404</Typography>
      <Typography variant="h5">Page Not Found</Typography>
      <Button variant="contained" onClick={() => navigate(home)}>Go Home</Button>
    </Box>
  );
}
