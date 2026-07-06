import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
    Box,
    InputAdornment,
    IconButton,
    CircularProgress,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

interface Column<T> {
    id: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    width?: string | number;
    align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (row: T) => void;
    searchable?: boolean;
    filterContent?: React.ReactNode;
    initialSearch?: string;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    isLoading = false,
    searchPlaceholder = "Search...",
    onRowClick,
    searchable = true,
    filterContent,
    initialSearch = "",
}: DataTableProps<T>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter((row) =>
            Object.values(row).some((val) =>
                String(val).toLowerCase().includes(lowerQuery)
            )
        );
    }, [data, searchQuery]);

    const paginatedData = useMemo(() => {
        return filteredData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredData, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2, boxShadow: 1 }}>
            {(searchable || filterContent) && (
                <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                    {searchable && (
                        <TextField
                            size="small"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ maxWidth: 300 }}
                        />
                    )}
                    {filterContent && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <IconButton size="small" sx={{ mr: 1 }}><FilterListIcon /></IconButton>
                            {filterContent}
                        </Box>
                    )}
                </Box>
            )}

            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={String(column.id)}
                                    align={column.align || "left"}
                                    style={{ width: column.width, fontWeight: "bold" }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No records found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <TableRow
                                    hover
                                    key={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    sx={{ cursor: onRowClick ? "pointer" : "default" }}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={String(column.id)} align={column.align || "left"}>
                                            {column.render
                                                ? column.render(row)
                                                : (row[column.id as keyof T] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
