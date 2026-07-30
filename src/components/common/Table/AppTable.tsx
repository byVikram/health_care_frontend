// src/components/common/Table/AppTable.tsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Skeleton } from "@mui/material";
import { ReactNode } from "react";

export interface Column<T = object> {
  field: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T) => ReactNode;
}

interface AppTableProps<T extends object = Record<string, unknown>> {
  columns?: Column<T>[];
  rows?: T[];
  loading?: boolean;
  emptyMessage?: string;
  rowSx?: (row: T) => Record<string, unknown>;
}

export default function AppTable<T extends object>(props: AppTableProps<T> & { onRowClick?: (row: T) => void }) {
  const {
    columns = [],
    rows = [],
    loading = false,
    emptyMessage = "No data found.",
    rowSx,
    onRowClick,
  } = props;
  return (
    <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f0f7fd" }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                align={col.align || "left"}
                sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid", borderColor: "divider", py: 1.5 }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.field}><Skeleton variant="text" width="80%" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{emptyMessage}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow
                key={((row as Record<string, unknown>).id as string | number | undefined) ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  "&:last-child td": { border: 0 },
                  "&:hover": { bgcolor: "#f8fbff" },
                  transition: "background 0.15s",
                  cursor: onRowClick ? "pointer" : "default",
                  ...(rowSx?.(row) ?? {}),
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.field} align={col.align || "left"} sx={{ color: "text.primary", fontSize: "0.875rem", py: 1.75 }}>
                    {col.render ? col.render((row as Record<string, unknown>)[col.field], row) : ((row as Record<string, unknown>)[col.field] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
