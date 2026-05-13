import React, { useState } from 'react';
import {
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
	Paper, Chip, CircularProgress, Typography, Box, Tooltip, IconButton
} from '@mui/material';
import PaginationBar from '../../../pagination/Pagination';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ColumnOption {
	value: string;
	label: string;
	color: string;
}

interface Column<T extends Record<string, unknown>> {
	id: keyof T;
	label: string;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
	format?: (value: T[keyof T], row: T) => React.ReactNode;
	options?: ColumnOption[];
	width?: string | number;
	variant?: string;
	truncateWithEllipsis?: boolean;
}

interface CustomTableProps<T extends Record<string, unknown>> {
	columns: Column<T>[];
	data: T[];
	totalRows: number;
	isAction?: boolean;
	loading?: boolean;
	defaultSortBy?: keyof T;
	defaultSortDirection?: 'asc' | 'desc';
	defaultPage?: number;
	defaultPageSize?: number;
	pageSizeOptions?: number[];
	onSortChange?: (sortBy: keyof T, sortDirection: 'asc' | 'desc') => void;
	onPageChange?: (page: number, pageSize: number) => void;
	onCellChange?: (rowId: T['id'], columnId: keyof T, newValue: T[keyof T]) => void;
	emptyMessage?: string;
	showPagination?: boolean;
	rowPadding?: string;
	onRefresh?: () => void;
	onRowClick?: (row: T) => void;
	smallFont?: boolean;
	highlightedRowValue?: string | number;
	highlightedRowKey?: keyof T;
	highlightColor?: string;
	getRowProps?: (row: T) => React.HTMLAttributes<HTMLTableRowElement>;
}

function AppTable<T extends Record<string, unknown> & { id: string | number }>(props: CustomTableProps<T>) {
	const {
		columns,
		data,
		totalRows,
		isAction = false,
		loading = false,
		defaultSortBy,
		defaultSortDirection = 'asc',
		defaultPage = 0,
		defaultPageSize = 10,
		onSortChange,
		onPageChange,
		emptyMessage = 'No data available',
		showPagination = true,
		rowPadding = '2px 12px',
		onRefresh,
		onRowClick,
		highlightedRowValue,
		highlightedRowKey,
		highlightColor = '#E3F2FD',
		getRowProps,
		smallFont = false,
	} = props;

	const [order, setOrder] = useState<'asc' | 'desc'>(defaultSortDirection);
	const [orderBy, setOrderBy] = useState<keyof T>(defaultSortBy || columns[0].id);
	const [page, setPage] = useState(defaultPage);
	const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

	const handleRequestSort = (property: keyof T, isAsc: boolean) => {
		const newOrder = isAsc ? 'asc' : 'desc';
		setOrder(newOrder);
		setOrderBy(property);
		onSortChange?.(property, newOrder);
	};

	const renderCellContent = (column: Column<T>, value: T[keyof T], row: T): React.ReactNode => {
		if (column.format) return column.format(value, row);

		if (column.variant === 'box') {
			const num = Number(value);
			const showRefresh = value == null || Number.isNaN(num) || num === 0;
			return (
				<Box
					sx={(theme) => ({
						width: 20,
						height: 20,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						border: `1px solid ${theme.palette.primary.main}`,
						borderRadius: '4px',
						p: '2px',
						color: theme.palette.primary.main,
					})}
				>
					{showRefresh ? (
						<Tooltip title="Refresh list">
							<span>
								<IconButton
									size="small"
									onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
									disabled={loading}
									sx={{ p: 0, opacity: loading ? 0.5 : 1 }}
								>
									<RefreshIcon sx={{ fontSize: 16 }} style={{ color: '#0954D5' }} />
								</IconButton>
							</span>
						</Tooltip>
					) : (
						<Typography fontSize={12} variant="body2" color="inherit">
							{Math.floor(num)}
						</Typography>
					)}
				</Box>
			);
		}

		if (column.options) {
			const selectedOption = column.options.find(opt => opt.value === value) || column.options[0];
			return (
				<Chip
					label={selectedOption.label}
					style={{ backgroundColor: selectedOption.color, color: 'white' }}
				/>
			);
		}

		const istruncated = column.truncateWithEllipsis ?? true;
		const stringValue = String(value);

		if (istruncated) {
			return (
				<Tooltip title={stringValue} arrow>
					<Typography
						fontSize={12}
						variant="body2"
						color="text.main"
						sx={{
							cursor: 'pointer',
							maxWidth: '100%',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							display: 'block',
						}}
					>
						{(stringValue === 'undefined' || stringValue === 'null') ? '-' : stringValue}
					</Typography>
				</Tooltip>
			);
		}

		return (
			<Typography fontSize={12} variant="body2" color="text.main">
				{stringValue === 'undefined' ? '-' : stringValue}
			</Typography>
		);
	};

	const isEmpty = !loading && data?.length === 0;

	const isRowHighlighted = (row: T) => {
		if (highlightedRowValue === undefined || highlightedRowValue === null) return false;
		const key: keyof T = highlightedRowKey ?? ('id' as keyof T);
		return String(row[key]) === String(highlightedRowValue);
	};

	return (
		<>
			<TableContainer
				component={Paper}
				sx={{
					borderRadius: '12px',
					'&::-webkit-scrollbar': { width: '8px', height: '8px' },
					'&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '4px' },
					'&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
					'&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
				}}
			>
				<Table aria-label="Data table" role="table">

					{/* ── Teal header row ── */}
					<TableHead role="rowgroup">
						<TableRow role="rowgroup">
							{columns.map((column) => (
								<TableCell
									role="columnheader"
									key={String(column.id)}
									align={column.align || 'left'}
									sortDirection={orderBy === column.id ? order : false}
									sx={{
										padding: '14px 12px',
										width: column.width || 'auto',
										minWidth: column.width || 'auto',
										maxWidth: column.width || 'none',
										borderLeft: '0px !important',
										backgroundColor: '#E0F0F3',
										borderBottom: '2px solid #A8D5DC',
									}}
								>
									{column.sortable ? (
										<TableSortLabel
											active={orderBy === column.id}
											direction={orderBy === column.id ? order : 'asc'}
											IconComponent={() => null}
											sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
										>
											<Typography fontSize={12} variant="body2" sx={{ fontWeight: 600, mr: 1, color: '#2E7D8C' }}>
												{column.label}
											</Typography>
											<Box sx={{ display: 'flex', flexDirection: 'row', lineHeight: 0, width: '25px' }}>
												<span
													role="button"
													tabIndex={0}
													aria-label={`Sort ${column.label} ascending`}
													onClick={() => handleRequestSort(column.id, true)}
													onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRequestSort(column.id, true); }}
													style={{ cursor: 'pointer', display: 'inline-flex' }}
												>
													<ArrowUpwardIcon
														sx={{ color: orderBy === column.id && order === 'asc' ? 'text.primary' : 'text.disabled', fontSize: '12px' }}
													/>
												</span>
												<span
													role="button"
													tabIndex={0}
													aria-label={`Sort ${column.label} descending`}
													onClick={() => handleRequestSort(column.id, false)}
													onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRequestSort(column.id, false); }}
													style={{ cursor: 'pointer', display: 'inline-flex' }}
												>
													<ArrowDownwardIcon
														sx={{ color: orderBy === column.id && order === 'desc' ? 'text.primary' : 'text.disabled', fontSize: '12px' }}
													/>
												</span>
											</Box>
										</TableSortLabel>
									) : (
										<Typography
											fontSize={12}
											variant="body2"
											sx={{ fontWeight: 600, color: '#2E7D8C' }}
											aria-label={column.label}
											tabIndex={0}
										>
											{column.label}
										</Typography>
									)}
								</TableCell>
							))}
							{isAction && (
								<TableCell
									key="actions"
									align="right"
									sx={{ backgroundColor: '#E0F0F3', borderBottom: '2px solid #A8D5DC' }}
								>
									Actions
								</TableCell>
							)}
						</TableRow>
					</TableHead>

					{/* ── Body with divider line after each row ── */}
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={columns.length + (isAction ? 1 : 0)} align="center">
									<CircularProgress />
								</TableCell>
							</TableRow>
						) : isEmpty ? (
							<TableRow>
								<TableCell colSpan={columns.length + (isAction ? 1 : 0)} align="center">
									<Box py={4}>
										<Typography fontSize={12} variant="body2" color="text.secondary" tabIndex={0}>
											{emptyMessage}
										</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							data?.map((row) => {
								const highlighted = isRowHighlighted(row);
								const rowProps = getRowProps?.(row) ?? {};
								return (
									<TableRow
										key={String(row.id)}
										hover
										{...rowProps}
										sx={{
											backgroundColor: highlighted ? highlightColor : '#ffffff',
											'&:hover': { backgroundColor: highlighted ? highlightColor : '#F5FAFB' },
											...(rowProps.style || {}),
										}}
									>
										{columns.map((column) => (
											<TableCell
												key={String(column.id)}
												align={column.align || 'left'}
												width={column.width}
												onClick={() => onRowClick?.(row)}
												sx={{
													padding: rowPadding,
													width: column.width || 'auto',
													minWidth: column.width || 'auto',
													maxWidth: column.width || 'none',
													borderLeft: '0px !important',
													borderBottom: '1px solid #E0E0E0',
												}}
											>
												<Box
													sx={{
														display: 'flex',
														justifyContent:
															column.align === 'center' ? 'center'
															: column.align === 'right' ? 'flex-end'
															: 'flex-start',
														width: '100%',
														'& > *': { mr: column.sortable ? '25px' : 0 },
													}}
												>
													{renderCellContent(column, row[column.id], row)}
												</Box>
											</TableCell>
										))}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{showPagination && (
				<PaginationBar
					page={page}
					pageSize={rowsPerPage}
					totalRows={totalRows}
					pageSizeOptions={[10, 20, 50]}
					onPageChange={(newPage) => {
						setPage(newPage);
						onPageChange?.(newPage, rowsPerPage);
					}}
					onPageSizeChange={(newSize) => {
						setRowsPerPage(newSize);
						setPage(1);
						onPageChange?.(1, newSize);
					}}
					smallFont={smallFont}
				/>
			)}
		</>
	);
}

export default AppTable;
