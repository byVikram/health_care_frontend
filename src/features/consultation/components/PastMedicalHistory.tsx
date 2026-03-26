// src/features/consultation/components/PastMedicalHistory.tsx
import { useState } from "react";
import { Box, Typography, Select, MenuItem, FormControl } from "@mui/material";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import { customCardStyle } from "../../../styles/commonStyles";

const TABS = [
  { id: "prescription", label: "Prescription" },
  { id: "laboratory",   label: "Laboratory"   },
  { id: "radiology",    label: "Radiology"    },
  { id: "ancillary",    label: "Ancillary"    },
];

const EMPTY_MESSAGES: Record<string, string> = {
  prescription: "No past prescription history!",
  laboratory:   "No past lab test history!",
  radiology:    "No past radiology history!",
  ancillary:    "No past ancillary history!",
};

// Illustrated icon placeholders — swap with actual images when available
const TAB_ICONS: Record<string, React.ReactNode> = {
  prescription: (
    <Box sx={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width="44" height="44">
        <rect x="10" y="4" width="28" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5"/>
        <text x="18" y="26" fontSize="14" fill="#2B6F71" fontWeight="bold">Rx</text>
        <line x1="14" y1="32" x2="34" y2="32" stroke="#2B6F71" strokeWidth="1.2"/>
        <line x1="14" y1="36" x2="28" y2="36" stroke="#2B6F71" strokeWidth="1.2"/>
      </svg>
    </Box>
  ),
  laboratory: (
    <Box sx={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width="44" height="44">
        <rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5"/>
        <rect x="13" y="10" width="22" height="4" rx="1" fill="#2B6F71" opacity="0.3"/>
        <circle cx="18" cy="28" r="4" fill="#e53935" opacity="0.7"/>
        <circle cx="30" cy="28" r="4" fill="#2B6F71" opacity="0.5"/>
        <line x1="13" y1="20" x2="35" y2="20" stroke="#2B6F71" strokeWidth="1.2"/>
      </svg>
    </Box>
  ),
  radiology: (
    <Box sx={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width="44" height="44">
        <rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5"/>
        <ellipse cx="24" cy="22" rx="10" ry="12" fill="none" stroke="#2B6F71" strokeWidth="1.5"/>
        <line x1="24" y1="10" x2="24" y2="34" stroke="#2B6F71" strokeWidth="1" strokeDasharray="2"/>
        <line x1="14" y1="22" x2="34" y2="22" stroke="#2B6F71" strokeWidth="1" strokeDasharray="2"/>
      </svg>
    </Box>
  ),
  ancillary: (
    <Box sx={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 48 48" width="44" height="44">
        <rect x="8" y="4" width="32" height="36" rx="3" fill="#f0f7f8" stroke="#2B6F71" strokeWidth="1.5"/>
        <path d="M20 18 L24 14 L28 18" fill="none" stroke="#e53935" strokeWidth="1.5"/>
        <rect x="21" y="18" width="6" height="8" fill="#e53935" opacity="0.7"/>
        <line x1="13" y1="30" x2="35" y2="30" stroke="#2B6F71" strokeWidth="1.2"/>
        <line x1="13" y1="34" x2="28" y2="34" stroke="#2B6F71" strokeWidth="1.2"/>
      </svg>
    </Box>
  ),
};

const DATE_OPTIONS = [
  { value: "all",      label: "All"          },
  { value: "today",    label: "Today"        },
  { value: "week",     label: "This Week"    },
  { value: "month",    label: "This Month"   },
  { value: "3months",  label: "Last 3 Months"},
  { value: "year",     label: "This Year"    },
];

export default function PastMedicalHistory() {
  const [activeTab, setActiveTab] = useState("laboratory");
  const [selectedDate, setSelectedDate] = useState("all");

  return (
    <Box sx={{ ...customCardStyle, mt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.dark" }}>
        Past medical history
      </Typography>

      {/* Category tabs */}
      <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                display: "flex", flexDirection: "column", alignItems: "center",
                cursor: "pointer", px: 1, pb: 1,
                borderBottom: isActive ? "2.5px solid" : "2.5px solid transparent",
                borderColor: isActive ? "primary.main" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {TAB_ICONS[tab.id]}
              <Typography
                variant="caption"
                sx={{
                  fontSize: "12px", fontWeight: isActive ? 600 : 400, mt: 0.5,
                  color: isActive ? "primary.main" : "text.secondary",
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Select date */}
      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "12px", fontWeight: 500, display: "block", mb: 0.8 }}>
        Select date
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          displayEmpty
          sx={{ borderRadius: "8px", fontSize: "13px", color: "primary.main", fontWeight: 500 }}
        >
          {DATE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "13px" }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Empty state */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1.5 }}>
        <Box
          sx={{
            width: 80, height: 80, borderRadius: "50%",
            border: "2px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <SentimentDissatisfiedOutlinedIcon sx={{ fontSize: 44, color: "text.disabled" }} />
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px", fontWeight: 500 }}>
          {EMPTY_MESSAGES[activeTab]}
        </Typography>
      </Box>
    </Box>
  );
}