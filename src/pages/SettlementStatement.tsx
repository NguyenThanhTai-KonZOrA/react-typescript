import React, { useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Paper,
    CircularProgress,
    Stack,
    useTheme,
    useMediaQuery,
    Alert,
} from "@mui/material";
import { Download, Search } from "@mui/icons-material";
import { settlementStatementSearch } from "../services/api";
import { SettlementStatementRequest, SettlementStatementResponse } from "../types";
import { Layout } from "../components/layout";

export default function SettlementStatementPage() {
    const [filters, setFilters] = useState({
        representative: "",
        representativeId: "",
        programName: "",
        dateStart: "",
        dateEnd: ""
    });
    const [results, setResults] = useState<SettlementStatementResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const req: SettlementStatementRequest = {
                TeamRepresentativeName: filters.representative,
                TeamRepresentativeId: filters.representativeId,
                ProgramName: filters.programName,
                StartDate: filters.dateStart,
                EndDate: filters.dateEnd
            };
            const res = await settlementStatementSearch(req);
            setResults(res);
            setPage(1); // Reset to first page on new search
        } catch (e: any) {
            setError(e.message || "Error fetching data");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    function formatDate(dateStr?: string) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function getTotalWinLoss() {
        return results.reduce((sum, row) => {
            const val = typeof row.casinoWinLoss === "string"
                ? Number((row.casinoWinLoss as string).replace(/,/g, ""))
                : Number(row.casinoWinLoss);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    }

    function getAwardSettlement(total: number) {
        let percent = 0.05;
        if (total > 90000) percent = 0.12;
        else if (total > 30000) percent = 0.10;
        return Math.round(total * percent * 10) / 10;
    }

    const totalWinLoss = getTotalWinLoss();
    const awardSettlement = getAwardSettlement(totalWinLoss);

    // Lấy dữ liệu trang hiện tại
    const totalPages = Math.max(1, Math.ceil(results.length / rowsPerPage));
    const pagedResults = results.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
                {/* Search Section */}
                <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
                    <CardHeader
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Search color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Settlement Statement
                                </Typography>
                            </Box>
                        }
                        sx={{
                            bgcolor: 'primary.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    />
                    <CardContent>
                        <Stack spacing={3}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 3
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Team Representative"
                                        name="representative"
                                        value={filters.representative}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Representative ID"
                                        name="representativeId"
                                        value={filters.representativeId}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Program Name"
                                        name="programName"
                                        value={filters.programName}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 3,
                                alignItems: { md: 'center' }
                            }}>
                                <Box sx={{ flex: { xs: 1, md: 'auto' } }}>
                                    <TextField
                                        label="Start Date"
                                        name="dateStart"
                                        type="date"
                                        value={filters.dateStart}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ flex: { xs: 1, md: 'auto' } }}>
                                    <TextField
                                        label="End Date"
                                        name="dateEnd"
                                        type="date"
                                        value={filters.dateEnd}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box sx={{
                                    flex: { xs: 1, md: 'auto' },
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: "primary.main",
                                            ":hover": { bgcolor: "primary.dark" },
                                            minWidth: 140,
                                            minHeight: 40,
                                            fontWeight: 600,
                                            px: 4
                                        }}
                                        disabled={loading}
                                        fullWidth={isMobile}
                                        size="large"
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : "Search"}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: "success.main",
                                            ":hover": { bgcolor: "success.dark" },
                                            minWidth: 140,
                                            minHeight: 40,
                                            fontWeight: 600,
                                            px: 4
                                        }}
                                        disabled={loading}
                                        fullWidth={isMobile}
                                        size="large"
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : "Export Excel"}
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                        {error && (
                            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardHeader
                        title={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="h6" sx={{ fontWeight: 600 }} color="error">
                                    📊 Settlement Details:
                                </Typography>
                                <Chip
                                    label={`Total: ${results.length}`}
                                    color="default"
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        }
                        action={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Rows per page</InputLabel>
                                    <Select
                                        label="Rows per page"
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setPage(1);
                                        }}
                                    >
                                        {[5, 10, 20, 50].map((size) => (
                                            <MenuItem key={size} value={size}>
                                                {size}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        }
                        sx={{
                            bgcolor: 'grey.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            flexDirection: { xs: 'column', lg: 'row' },
                            alignItems: { lg: 'center' },
                            '& .MuiCardHeader-action': {
                                margin: { xs: '8px 0 0 0', lg: 0 },
                                alignSelf: { xs: 'stretch', lg: 'auto' }
                            }
                        }}
                    />
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                maxHeight: { xs: '60vh', md: '70vh' },
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                    height: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#c1c1c1',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: '#a8a8a8',
                                },
                            }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 60,
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 1001,
                                            }}
                                        >
                                            No.
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 150,
                                            }}
                                        >
                                            Member ID
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 180,
                                            }}
                                        >
                                            Member Name
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 140,
                                            }}
                                        >
                                            Joined Date
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 170,
                                            }}
                                        >
                                            Last Gaming Date
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 120,
                                            }}
                                        >
                                            Eligible (Y/N)
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 180,
                                            }}
                                        >
                                            Casino win/(loss)
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagedResults.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {pagedResults.map((row, idx) => (
                                        <TableRow
                                            key={row.memberId ?? idx}
                                            hover
                                            sx={{
                                                "&:hover": { backgroundColor: "#e3eafc" }
                                            }}
                                        >
                                            <TableCell align="center" sx={{
                                                fontWeight: 'bold',
                                                position: 'sticky',
                                                left: 0,
                                                bgcolor: 'background.paper',
                                                zIndex: 1000,
                                                borderRight: '1px solid',
                                                borderColor: 'divider',
                                            }}>
                                                {(page - 1) * rowsPerPage + idx + 1}
                                            </TableCell>
                                            <TableCell align="center">{row.memberId}</TableCell>
                                            <TableCell align="center">{row.memberName}</TableCell>
                                            <TableCell align="center">{formatDate(row.joinedDate)}</TableCell>
                                            <TableCell align="center">{formatDate(row.lastGamingDate)}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.eligible === true ? "Y" : "N"}
                                                    color={row.eligible === true ? "success" : "warning"}
                                                    size="small"
                                                    variant={row.eligible === false ? "filled" : "filled"}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{row.casinoWinLoss}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* Pagination */}
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'grey.50'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Page {results.length === 0 ? 0 : page} / {totalPages} • Total {results.length} rows
                            </Typography>
                            <ButtonGroup variant="outlined" size="small">
                                <Button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                >
                                    « First
                                </Button>
                                <Button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ‹ Previous
                                </Button>
                                <Button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                >
                                    Next ›
                                </Button>
                                <Button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page >= totalPages}
                                >
                                    Last »
                                </Button>
                            </ButtonGroup>
                        </Box>
                        
                        {/* Summary Section */}
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'primary.50',
                            borderTop: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Total: {totalWinLoss.toLocaleString()}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Award Settlement: {awardSettlement.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Layout>
    );
}