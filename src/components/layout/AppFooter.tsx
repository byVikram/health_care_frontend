// src/components/layout/AppFooter.tsx
import { Box, Typography, Divider, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const services = ["Doctor Portal", "Patient Portal", "Pharmacy", "Lab And Radiology", "Ancillary Services"];
const resources = ["Blog", "Podcasts", "Events", "Community"];
const company = ["About Us", "Contact", "Careers"];

// Footer links that have a page; the others are still plain text.
const linkPaths: Record<string, string> = {
  "About Us": ROUTES.PUBLIC.ABOUT,
  Contact: ROUTES.PUBLIC.CONTACT,
  "Terms of use": ROUTES.PUBLIC.TERMS,
  "Privacy policy": ROUTES.PUBLIC.PRIVACY,
  "Data security": ROUTES.PUBLIC.DATA_SECURITY,
};

const legal = ["Terms of use", "Privacy policy", "Data security"];

interface FooterColumnProps {
  title: string;
  links: string[];
  legal?: boolean;
}

function FooterColumn({ title, links, legal = false }: FooterColumnProps) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: legal ? 1.5 : 1.2 }}>
      <Typography
        variant="body2"
        sx={{
          color: "#fff",
          fontWeight: legal ? 700 : 600,
          fontSize: "15px",
          mb: 0.5,
          ...(legal && { textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "14px", mb: 1 }),
        }}
      >
        {title}
      </Typography>
      {links.map((link) => (
        <Typography
          key={link}
          variant="body2"
          {...(linkPaths[link] && {
            role: "link",
            tabIndex: 0,
            onClick: () => navigate(linkPaths[link]),
            onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && navigate(linkPaths[link]),
          })}
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "13.5px",
            cursor: "pointer",
            "&:hover": { color: "#13C0C5" },
            transition: "color 0.15s",
          }}
        >
          {link}
        </Typography>
      ))}
    </Box>
  );
}

export default function AppFooter() {
  return (
    <Box sx={{ bgcolor: "#1E5059", mt: "auto" }}>
      <Box sx={{ maxWidth: "lg", mx: "auto", px: { xs: 3, md: 6 }, pt: 5, pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 8 },
            mb: 4,
          }}
        >
          <Box sx={{ maxWidth: 340, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography component="span" sx={{ fontSize: "18px", color: "#13C0C5", lineHeight: 1 }}>&#10035;</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontStyle: "italic", color: "#fff", letterSpacing: "-0.01em" }}>
                Whisper AI
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "13.5px", lineHeight: 1.7, mb: 2.5 }}>
              Our vision is to help mankind live healthier, longer lives by making quality healthcare accessible, affordable and convenient.
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {[
                { icon: <FacebookIcon fontSize="small" />, label: "Facebook" },
                { icon: <TwitterIcon fontSize="small" />, label: "Twitter" },
                { icon: <LinkedInIcon fontSize="small" />, label: "LinkedIn" },
                { icon: <InstagramIcon fontSize="small" />, label: "Instagram" },
              ].map(({ icon, label }) => (
                <IconButton
                  key={label}
                  size="small"
                  aria-label={label}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    "&:hover": { color: "#13C0C5", bgcolor: "rgba(255,255,255,0.08)" },
                    transition: "color 0.15s",
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end", gap: { xs: 4, md: 6 }, flexWrap: "wrap" }}>
            <FooterColumn title="Services" links={services} />
            <FooterColumn title="Resources" links={resources} />
            <FooterColumn title="Company" links={company} />
            <FooterColumn title="Legal" links={legal}  />
          </Box>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2.5 }} />
        <Typography variant="body2" align="center" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
          {"\u00A9"} 2024 Whisper AI. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
