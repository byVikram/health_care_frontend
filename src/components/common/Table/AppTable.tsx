// src/components/common/Table/AppTable.tsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Skeleton } from "@mui/material";
import { ReactNode } from "react";
import PaginationBar from "../../../pagination/Pagination";

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
  // Unified Pagination props
  page?: number;
  pageSize?: number;
  totalRows?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function AppTable<T extends object>(props: AppTableProps<T> & { onRowClick?: (row: T) => void }) {
  const {
    columns = [],
    rows = [],
    loading = false,
    emptyMessage = "No data found.",
    rowSx,
    onRowClick,
    page,
    pageSize,
    totalRows,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
  } = props;
  return (
    <TableContainer component={Paper} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 4px 20px rgba(15,23,42,0.015)" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc" }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                align={col.align || "left"}
                sx={{ fontWeight: 800, color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid", borderColor: "divider", py: 2 }}
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
                <Box sx={{ py: 6, textAlign: "center" }}>
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
                  "&:hover": { bgcolor: "#f1f5f9" },
                  transition: "background 0.15s ease",
                  cursor: onRowClick ? "pointer" : "default",
                  ...(rowSx?.(row) ?? {}),
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.field} align={col.align || "left"} sx={{ color: "#334155", fontSize: "0.85rem", py: 1.75, borderBottom: "1px solid", borderColor: "#f1f5f9" }}>
                    {col.render ? col.render((row as Record<string, unknown>)[col.field], row) : ((row as Record<string, unknown>)[col.field] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {page !== undefined &&
        pageSize !== undefined &&
        totalRows !== undefined &&
        onPageChange &&
        onPageSizeChange && (
          <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalRows={totalRows}
              pageSizeOptions={pageSizeOptions}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </Box>
        )}
    </TableContainer>
  );
}
