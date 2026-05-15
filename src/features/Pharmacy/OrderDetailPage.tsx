import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Button,
  Grid,
  Paper,
  Snackbar,
  Alert,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Phone,
  // CloudUpload,
  LocationOn,
  AccessTime,
  CalendarToday,
  LocalHospital,
  Person,
  KeyboardArrowDown,
  KeyboardArrowUp,
  CheckCircle,
  Inventory2,
  Cancel,
} from "@mui/icons-material";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubAction {
  label: string;
  icon: React.ReactNode;
  iconColor: string;
  targetStatus: string;
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  actions: SubAction[];
}

// ─── Status Config (teal theme) ──────────────────────────────────────────────

const statusOptions: StatusOption[] = [
  {
    value: "order_pending",
    label: "Order Pending",
    color: "#D97706",
    bg: "#FEF3C7",
    borderColor: "#FCD34D",
    actions: [
      {
        label: "Mark as Collected",
        icon: <CheckCircle fontSize="small" />,
        iconColor: "#16A34A",
        targetStatus: "order_collected",
      },
      {
        label: "Mark as Packed",
        icon: <Inventory2 fontSize="small" />,
        iconColor: "#2563EB",
        targetStatus: "order_packed",
      },
      {
        label: "Mark as Rejected",
        icon: <Cancel fontSize="small" />,
        iconColor: "#DC2626",
        targetStatus: "order_rejected",
      },
    ],
  },
  {
    value: "order_collected",
    label: "Order Collected",
    color: "#16A34A",
    bg: "#DCFCE7",
    borderColor: "#86EFAC",
    actions: [
      {
        label: "Mark as Packed",
        icon: <Inventory2 fontSize="small" />,
        iconColor: "#2563EB",
        targetStatus: "order_packed",
      },
      {
        label: "Mark as Rejected",
        icon: <Cancel fontSize="small" />,
        iconColor: "#DC2626",
        targetStatus: "order_rejected",
      },
    ],
  },
  {
    value: "order_packed",
    label: "Order Packed",
    color: "#2563EB",
    bg: "#DBEAFE",
    borderColor: "#93C5FD",
    actions: [
      {
        label: "Mark as Collected",
        icon: <CheckCircle fontSize="small" />,
        iconColor: "#16A34A",
        targetStatus: "order_collected",
      },
      {
        label: "Mark as Rejected",
        icon: <Cancel fontSize="small" />,
        iconColor: "#DC2626",
        targetStatus: "order_rejected",
      },
    ],
  },
  {
    value: "order_rejected",
    label: "Order Rejected",
    color: "#DC2626",
    bg: "#FEE2E2",
    borderColor: "#FCA5A5",
    actions: [
      {
        label: "Mark as Collected",
        icon: <CheckCircle fontSize="small" />,
        iconColor: "#16A34A",
        targetStatus: "order_collected",
      },
      {
        label: "Mark as Packed",
        icon: <Inventory2 fontSize="small" />,
        iconColor: "#2563EB",
        targetStatus: "order_packed",
      },
    ],
  },
];

// ─── Prescription mock data (medicines) ──────────────────────────────────────

const prescriptionMockData = [
  {
    medicine: "Tab. Augmentin 625mg",
    dosage: "1 - 0 - 1",
    duration: "x5 days",
    instructions: "After meals",
  },
  {
    medicine: "Tab. Escitalopram 10mg",
    dosage: "1 - 0 - 0",
    duration: "x10 days",
    instructions: "At bedtime",
  },
  {
    medicine: "Tab. Pantoprazole 40mg",
    dosage: "1 - 0 - 0",
    duration: "x5 days",
    instructions: "Before meals",
  },
];

// ─── Prescription image placeholder ──────────────────────────────────────────



// ─── Status Dropdown Component (collapsible) ────────────────────────────────

function StatusDropdown({
  status,
  onChange,
}: {
  status: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = statusOptions.find((s) => s.value === status)!;

  const handleAction = (targetStatus: string) => {
    onChange(targetStatus);
    setOpen(false);
  };

  return (
    <Box
      sx={{
        borderRadius: "10px",
        overflow: "hidden",
        border: `1.5px solid ${current.borderColor}`,
      }}
    >
      {/* Trigger row */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: current.bg,
          px: 2,
          py: 1.25,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.875rem", color: current.color }}
        >
          {current.label}
        </Typography>
        {open ? (
          <KeyboardArrowUp sx={{ color: current.color, fontSize: 20 }} />
        ) : (
          <KeyboardArrowDown sx={{ color: current.color, fontSize: 20 }} />
        )}
      </Box>

      {/* Sub-actions */}
      <Collapse in={open}>
        <List disablePadding sx={{ backgroundColor: "#fff" }}>
          {current.actions.map((action, idx) => (
            <Box key={action.targetStatus}>
              <ListItemButton
                onClick={() => handleAction(action.targetStatus)}
                sx={{
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#F9FAFB" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: action.iconColor }}>
                  {action.icon}
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  primaryTypographyProps={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                />
              </ListItemButton>
              {idx < current.actions.length - 1 && (
                <Divider sx={{ mx: 2, borderColor: "#F3F4F6" }} />
              )}
            </Box>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrescriptionLayout() {
  const [status, setStatus] = useState("order_pending");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage] = useState("");
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient and clinic contact details
  const patientContact = "9876543210";
  const clinicContact = "080 4567 1234";

  // Handle file upload
  // const handleUploadClick = () => {
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     console.log("Selected file:", file.name, file.type, file.size);
  //     setSnackbarMessage(`File "${file.name}" selected. Ready to upload.`);
  //     setSnackbarOpen(true);
  //     event.target.value = ""; // reset
  //   }
  // };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F4F9F9", minHeight: "100vh" }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* ─── LEFT COLUMN ─── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Patient Info Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #D0E2E2",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                  {/* Square Avatar with teal background */}
                  <Avatar
                    src="https://i.pravatar.cc/80?img=12"
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: "#00796B",
                      borderRadius: "8px",
                    }}
                  >
                    N
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="body1" fontWeight={700} color="#1A2A2A">
                        Nitin S H
                      </Typography>
                      <Typography variant="caption" color="#5F7F7F">
                        (OID1234)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <LocationOn sx={{ fontSize: 13, color: "#5F7F7F" }} />
                      <Typography variant="caption" color="#5F7F7F">
                        74 TV Enclave (Near JP Nagar, Ooty)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 12, color: "#5F7F7F" }} />
                        <Typography variant="caption" color="#5F7F7F">
                          22 Nov 2025
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 12, color: "#5F7F7F" }} />
                        <Typography variant="caption" color="#5F7F7F">
                          10:30 AM
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip
                    label="Pending"
                    size="small"
                    sx={{
                      bgcolor: "#E0F2F1",
                      color: "#00695C",
                      fontWeight: 600,
                      "& .MuiChip-label": { fontSize: "0.7rem" },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Contact Numbers Card (Patient + Clinic) */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #D0E2E2",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#00796B", mb: 2, letterSpacing: 0.3 }}
                >
                  CONTACT DETAILS
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Person sx={{ fontSize: 18, color: "#5F7F7F" }} />
                      <Typography variant="body2" color="#5F7F7F" fontWeight={500}>
                        Patient contact:
                      </Typography>
                      <Typography variant="body2" color="#1A2A2A" fontWeight={700}>
                        {patientContact}
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<Phone sx={{ fontSize: 16 }} />}
                      variant="text"
                      size="small"
                      component="a"
                      href={`tel:${patientContact}`}
                      sx={{
                        color: "#00796B",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        textTransform: "none",
                      }}
                    >
                      Call now
                    </Button>
                  </Box>

                  <Divider sx={{ borderColor: "#E0EFEF" }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <LocalHospital sx={{ fontSize: 18, color: "#5F7F7F" }} />
                      <Typography variant="body2" color="#5F7F7F" fontWeight={500}>
                        Clinic contact:
                      </Typography>
                      <Typography variant="body2" color="#1A2A2A" fontWeight={700}>
                        {clinicContact}
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<Phone sx={{ fontSize: 16 }} />}
                      variant="text"
                      size="small"
                      component="a"
                      href={`tel:${clinicContact.replace(/\s/g, "")}`}
                      sx={{
                        color: "#00796B",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        textTransform: "none",
                      }}
                    >
                      Call now
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Prescription Detail Card with mock data */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #D0E2E2",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#1A2A2A" mb={2}>
                  Prescription detail
                </Typography>

                {/* Mock prescription data table */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "#F8FCFC",
                    border: "1px solid #D0E2E2",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", paddingBottom: 8, color: "#5F7F7F", fontWeight: 600 }}>Medicine</th>
                        <th style={{ textAlign: "left", paddingBottom: 8, color: "#5F7F7F", fontWeight: 600 }}>Dosage</th>
                        <th style={{ textAlign: "left", paddingBottom: 8, color: "#5F7F7F", fontWeight: 600 }}>Duration</th>
                        <th style={{ textAlign: "left", paddingBottom: 8, color: "#5F7F7F", fontWeight: 600 }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionMockData.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "6px 0", color: "#1A2A2A", fontWeight: 500 }}>{item.medicine}</td>
                          <td style={{ padding: "6px 0", color: "#374151" }}>{item.dosage}</td>
                          <td style={{ padding: "6px 0", color: "#374151" }}>{item.duration}</td>
                          <td style={{ padding: "6px 0", color: "#374151" }}>{item.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Paper>

                {/* Prescription image */}
                {/* <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "#F8FCFC",
                    border: "1px solid #D0E2E2",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 160,
                  }}
                >
                  <img
                    src={prescriptionImage}
                    alt="Prescription"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 180,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Paper> */}
              </CardContent>
            </Card>

            {/* Upload Report Card with functional file picker */}
            {/* <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #D0E2E2",
                bgcolor: "#FFFFFF",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handleUploadClick}
                  sx={{
                    bgcolor: "#00796B",
                    color: "#FFFFFF",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.5,
                    "&:hover": { bgcolor: "#00695C" },
                    boxShadow: "none",
                  }}
                >
                  Upload report
                </Button>
              </CardContent>
            </Card> */}
          </Box>
        </Grid>

        {/* ─── RIGHT COLUMN ─── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid #D0E2E2",
              bgcolor: "#FFFFFF",
              position: "sticky",
              top: 24,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1A2A2A" mb={2}>
                Mark the status
              </Typography>

              <StatusDropdown status={status} onChange={setStatus} />

              <Divider sx={{ my: 2.5, borderColor: "#E0EFEF" }} />

              {/* Status History Timeline */}
              <Typography variant="caption" sx={{ fontWeight: 500, color: "#5F7F7F", mb: 1.5, display: "block" }}>
                Status History
              </Typography>
              {[
                { label: "Order placed", time: "22 Nov, 10:30 AM", done: true },
                { label: "Order Pending", time: "22 Nov, 10:32 AM", done: true },
                { label: "Confirmed", time: "—", done: false },
                { label: "Delivered", time: "—", done: false },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: item.done ? "#00796B" : "#D0DEDE",
                      mt: 0.4,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: item.done ? 600 : 400,
                        color: item.done ? "#1A2A2A" : "#8CA5A5",
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="#8CA5A5">
                      {item.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for upload feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}