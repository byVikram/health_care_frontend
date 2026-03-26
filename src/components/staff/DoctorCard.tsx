// components/doctor/DoctorCard.tsx
import { Box, Typography, Avatar, Rating, Button } from "@mui/material";
import AppButton from "../common/Button/AppButton";

interface DoctorCardProps {
    name: string;
    specialization: string;
    avatar?: string;
    rating?: number; // 0 to 5
    onBook?: () => void;
}

export default function DoctorCard({
    name,
    specialization,
    avatar,
    rating,
    onBook,
}: DoctorCardProps) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                border: "1px solid #e0e0e0",
                borderRadius: 1.5,
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                backgroundColor: "#fff",
                gap: 1.5,
                width: "100%",
                maxWidth: 400,
                transition: "transform 0.15s",
                "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
            }}
        >
            {/* Avatar */}
            <Avatar
                src={avatar}
                alt={name}
                sx={{ width: 50, height: 50 }}
            />

            {/* Info Section */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.2, fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                >
                    {specialization}
                </Typography>

                {rating !== undefined && (
                    <Rating
                        name="doctor-rating"
                        value={rating}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ fontSize: 14, mt: 0.2 }}
                    />
                )}
            </Box>

            {/* Action */}
            {onBook && (
                // <Button
                //     variant="contained"
                //     color="primary"
                //     size="small"
                //     sx={{ minWidth: 70, fontSize: 12, py: 0.5 }}
                //     onClick={onBook}
                // >
                //     Book
                // </Button>

                <AppButton
                    onClick={onBook}
                    label="Book"
                    size="small"
                />
            )}
        </Box>
    );
}