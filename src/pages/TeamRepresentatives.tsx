import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
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
    IconButton,
    Tooltip,
    Grid,
} from "@mui/material";
import { Search, Groups, CheckCircle, FileDownload } from "@mui/icons-material";
import RestoreIcon from '@mui/icons-material/Restore';
import PaymentIcon from '@mui/icons-material/Payment';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from "@mui/icons-material/Refresh";
import { getTeamRepresentatives, paymentTeamRepresentatives, downloadCrpReport, unPaidTeamRepresentatives } from "../services/api";
import { TeamRepresentativesRequest, TeamRepresentativesResponse, PaymentTeamRepresentativesRequest, GenerateCrpReportRequest, UnPaidTeamRepresentativesResponse, UnPaidTeamRepresentativesRequest } from "../types";
import { Layout } from "../components/layout";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function TeamRepresentativesPage() {
    // Set default filter values
    const defaultFilters = {
        teamRepresentativeName: "",
        teamRepresentativeId: "",
        programName: "",
        month: "",
        status: ""
    };
    const [filters, setFilters] = useState(defaultFilters);
    const [results, setResults] = useState<TeamRepresentativesResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState<string>(""); // Track which item is being processed
    const [downloadLoading, setDownloadLoading] = useState<string>(""); // Track which item is being downloaded
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isAdmin = useIsAdmin();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const req: TeamRepresentativesRequest = {
                TeamRepresentativeName: filters.teamRepresentativeName,
                TeamRepresentativeId: filters.teamRepresentativeId,
                ProgramName: filters.programName,
                Month: filters.month,
                Status: filters.status
            };
            const res = await getTeamRepresentatives(req);
            setResults(res);
            setPage(1); // Reset to first page on new search
        } catch (e: any) {
            setError(e.message || "Search error");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (item: TeamRepresentativesResponse) => {
        const paymentKey = `${item.teamRepresentativeId}-${item.month}`;
        setPaymentLoading(paymentKey);
        setError(null);
        setSuccess(null);

        try {
            const req: PaymentTeamRepresentativesRequest = {
                TeamRepresentativeName: item.teamRepresentativeName,
                TeamRepresentativeId: item.teamRepresentativeId,
                Month: item.month,
                PaymentTeamRepresentativesId: item.paymentTeamRepresentativesId
            };
            const res = await paymentTeamRepresentatives(req);

            if (res && res.isPayment) {
                handleSearch();
                setSuccess(`Payment successful for ${item.teamRepresentativeName}`);
                // Refresh data after successful payment
            } else {
                setError("Payment failed");
            }
        } catch (e: any) {
            setError(e.message || "Error occurred during payment");
        } finally {
            setPaymentLoading("");
        }
    };

    const handleUnPaid = async (item: UnPaidTeamRepresentativesResponse) => {
        const unPaidKey = `${item.paymentTeamRepresentativesId}-${item.isUnPaid}`;
        setPaymentLoading(unPaidKey);
        setError(null);
        setSuccess(null);

        try {
            const req: UnPaidTeamRepresentativesRequest = {
                PaymentTeamRepresentativesId: item.paymentTeamRepresentativesId
            };
            const res = await unPaidTeamRepresentatives(req);

            if (res && res.isUnPaid) {
                handleSearch();
                setSuccess(`Unpaid successful!`);
                // Refresh data after successful payment
            } else {
                setError("Unpaid status check failed");
            }
        } catch (e: any) {
            setError(e.message || "Error occurred during payment");
        } finally {
            setPaymentLoading("");
        }
    };

    const handleDownload = async (item: TeamRepresentativesResponse) => {
        const downloadKey = `${item.teamRepresentativeId}-${item.month}`;
        setDownloadLoading(downloadKey);
        setError(null);
        setSuccess(null);

        try {
            const req: GenerateCrpReportRequest = {
                TeamRepresentativeId: item.teamRepresentativeId,
                Month: item.month
            };

            await downloadCrpReport(req);
            handleSearch();
            setSuccess(`Report downloaded successfully for ${item.teamRepresentativeName}`);
        } catch (e: any) {
            setError(e.message || "Error occurred during report download");
        } finally {
            setDownloadLoading("");
        }
    };

    function formatMonth(dateStr?: string) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${month}/${year}`;
    }

    function formatDate(dateStr?: string) {
        if (!dateStr) return "";
        if (dateStr === "0001-01-01T00:00:00") return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(results.length / rowsPerPage));
    const pagedResults = results.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Generate month options for the last 12 months
    const generateMonthOptions = () => {
        const options = [];
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthStr = date.toISOString(); // YYYY-MM format
            const displayStr = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
            options.push({ value: monthStr, label: displayStr });
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line
    }, [filters]);

    const handleRefreshFilter = () => {
        setFilters(defaultFilters);
        // auto refresh data
        fetchData(defaultFilters);
    };

    function fetchData(defaultFilters: { teamRepresentativeName: string; teamRepresentativeId: string; programName: string; month: string; }) {
        handleSearch();
    }


    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
                {/* Search Section */}
                <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
                    <CardHeader
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Groups color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    CRP Management
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
                                        label="Team Representative Name"
                                        name="teamRepresentativeName"
                                        value={filters.teamRepresentativeName}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Team Representative ID"
                                        name="teamRepresentativeId"
                                        value={filters.teamRepresentativeId}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                {/* <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Program Name"
                                        name="programName"
                                        value={filters.programName}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box> */}
                                <Box sx={{ flex: 1 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="status-label">Status</InputLabel>
                                        <Select
                                            labelId="status-label"
                                            label="Status"
                                            name="status"
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Paid">Paid</MenuItem>
                                            <MenuItem value="Voided">Voided</MenuItem>
                                            <MenuItem value="Failed">Failed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 3,
                                alignItems: { md: 'center' }
                            }}>
                                {/* <Box sx={{ flex: { xs: 1, md: '0 0 300px' } }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Month</InputLabel>
                                        <Select
                                            name="month"
                                            value={filters.month}
                                            label="Month"
                                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                        >
                                            <MenuItem value="">
                                                <em>All</em>
                                            </MenuItem>
                                            {monthOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box> */}

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
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefreshFilter}
                                        sx={{ ml: 2, minWidth: 120, fontWeight: 600 }}
                                    >
                                        Refresh
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>

                        {error && (
                            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                                {success}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardHeader
                        title={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="h6" sx={{ fontWeight: 600 }} color="primary">
                                    📊 Team Representatives List:
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
                                                minWidth: 200,
                                            }}
                                        >
                                            SEGMENT
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 200,
                                            }}
                                        >
                                            Representative Name
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
                                            Representative ID
                                        </TableCell>
                                        {/* <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 180,
                                            }}
                                        >
                                            Program Name
                                        </TableCell> */}
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                minWidth: 120,
                                            }}
                                        >
                                            Month
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
                                            Settlement Doc
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
                                            Casino win/(loss)
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
                                            Total Award
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
                                            Status
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
                                            Payment By
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
                                            Payment Date
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
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagedResults.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                {loading ? (
                                                    <CircularProgress sx={{ my: 2 }} />
                                                ) : (
                                                    "No data available"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {pagedResults.map((row, index) => {
                                        const paymentKey = `${row.teamRepresentativeId}-${row.month}`;
                                        const unPaidKey = `${row.paymentTeamRepresentativesId}-${row.month}`;
                                        const isPaymentLoading = paymentLoading === paymentKey;
                                        const isDownloadLoading = downloadLoading === `${row.teamRepresentativeId}-${row.month}`;
                                        const isUnPaidLoading = paymentLoading === unPaidKey

                                        return (
                                            <TableRow
                                                key={`${row.teamRepresentativeId}-${row.month}-${index}`}
                                                hover
                                                sx={{
                                                    "&:hover": { backgroundColor: "#f5f5f5" }
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
                                                    {(page - 1) * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center">{row.segment}</TableCell>
                                                <TableCell align="center">{row.teamRepresentativeName}</TableCell>
                                                <TableCell align="center">{row.teamRepresentativeId}</TableCell>
                                                {/* <TableCell align="center">Team Together – Win Together</TableCell> */}
                                                <TableCell align="center">{formatMonth(row.month)}</TableCell>
                                                <TableCell align="center">{row.settlementDoc}</TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" component="div" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: row.casinoWinLoss < 0 ? 'error.main' : 'success.main'
                                                            }}
                                                        >
                                                            {row.casinoWinLoss < 0
                                                                ? `(${Math.abs(row.casinoWinLoss).toLocaleString()})`
                                                                : row.casinoWinLoss.toLocaleString()
                                                            }
                                                        </Typography>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: row.awardTotal < 0 ? 'error.main' : 'success.main'
                                                        }}
                                                    >
                                                        {row.awardTotal < 0
                                                            ? `(${Math.abs(row.awardTotal).toLocaleString()})`
                                                            : row.awardTotal.toLocaleString()
                                                        }
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.isPayment ? "Paid" : "Unpaid"}
                                                        color={row.isPayment ? "success" : "warning"}
                                                        size="small"
                                                        variant={row.isPayment ? "filled" : "outlined"}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{row.isPayment ? row.paymentBy : "-"}</TableCell>
                                                <TableCell align="center">{formatDate(row.paymentDate)}</TableCell>
                                                <TableCell align="center">
                                                    {isAdmin && (
                                                        <>
                                                            <Tooltip title={row.isPayment ? "Paid" : "Mark as paid"}>
                                                                <span>
                                                                    <IconButton
                                                                        color={row.isPayment ? "success" : "primary"}
                                                                        onClick={() => handlePayment(row)}
                                                                        disabled={row.isPayment || isPaymentLoading || loading}
                                                                        sx={{
                                                                            '&:hover': {
                                                                                bgcolor: row.isPayment ? 'success.50' : 'primary.50'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isPaymentLoading ? (
                                                                            <CircularProgress size={20} />
                                                                        ) : row.isPayment ? (
                                                                            <CheckCircle />
                                                                        ) : (
                                                                            <PaymentIcon />
                                                                        )}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip title="UnPaid">
                                                                <span>
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => handleUnPaid({ paymentTeamRepresentativesId: row.paymentTeamRepresentativesId, isUnPaid: false })}
                                                                        disabled={!row.isPayment || isUnPaidLoading || loading}
                                                                        sx={{
                                                                            '&:hover': {
                                                                                bgcolor: 'primary.50'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isUnPaidLoading ? (
                                                                            <CircularProgress size={20} />
                                                                        ) : (
                                                                            <RestoreIcon />
                                                                        )}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                            {!row.isPrintf && (
                                                                <Tooltip title="Download">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            onClick={() => handleDownload(row)}
                                                                            disabled={isDownloadLoading || loading || !row.isPayment}
                                                                            sx={{
                                                                                '&:hover': {
                                                                                    bgcolor: 'primary.50'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {isDownloadLoading ? (
                                                                                <CircularProgress size={20} />
                                                                            ) : (
                                                                                <FileDownload />
                                                                            )}
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                            {row.isPrintf && (
                                                                <Tooltip title="Reprint">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            onClick={() => handleDownload(row)}
                                                                            disabled={isDownloadLoading || loading}
                                                                            sx={{
                                                                                '&:hover': {
                                                                                    bgcolor: 'primary.50'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {isDownloadLoading ? (
                                                                                <CircularProgress size={20} />
                                                                            ) : (
                                                                                <PrintIcon />
                                                                            )}
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                >
                                    « First
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ‹ Previous
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                >
                                    Next ›
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page >= totalPages}
                                >
                                    Last »
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Layout>
    );
}
