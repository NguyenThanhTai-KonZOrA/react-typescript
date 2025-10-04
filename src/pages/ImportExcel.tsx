import React, { useEffect, useMemo, useState } from "react";
import { approveBatch, downloadAnnotated, getBatchDetails, uploadExcel } from "../services/api";
import { ImportDetailsResponse } from "../types";
import { useNavigate } from "react-router-dom";

import {
    Alert,
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
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Paper,
    Grid,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {
    CloudUpload,
    Download,
    CheckCircle,
    GetApp
} from "@mui/icons-material";
import { Layout } from "../components/layout";

export default function ImportExcelPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [details, setDetails] = useState<ImportDetailsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const hasErrors = useMemo(() => (details ? details.invalidRows > 0 : true), [details]);

    // Reset page when details change
    useEffect(() => setPage(1), [details, pageSize]);

    const totalPages = useMemo(() => {
        if (!details) return 1;
        return Math.max(1, Math.ceil(details.rows.length / pageSize));
    }, [details, pageSize]);

    const pageRows = useMemo(() => {
        if (!details) return [];
        const start = (page - 1) * pageSize;
        return details.rows.slice(start, start + pageSize);
    }, [details, page, pageSize]);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    async function onUpload() {
        setError(null);
        setSuccess(null);
        if (!selectedFile) {
            setError("Please select a file (.xlsx).");
            return;
        }
        setLoading(true);
        try {
            const summary = await uploadExcel(selectedFile);
            const full = await getBatchDetails(summary.batchId);
            setDetails(full);
            setSuccess("Upload successful.");
        } catch (e: any) {
            setError(e.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    }

    async function onApprove() {
        if (!details) return;
        setError(null);
        setSuccess(null);
        setApproving(true);
        try {
            const res = await approveBatch(details.batchId);
            setSuccess(`Approved successfully. Settlements: ${res.settlementsInserted}`);
            const refreshed = await getBatchDetails(details.batchId);
            setDetails(refreshed);
        } catch (e: any) {
            setError(e.message || "Approve failed.");
        } finally {
            setApproving(false);
        }
    }

    async function onDownload() {
        setError(null);
        setSuccess(null);
        try {
            if (!details) throw new Error("No batch available.");
            await downloadAnnotated(details.batchId);
        } catch (e: any) {
            setError(e.message || "Download failed.");
        }
    }

    async function onDownloadTemplate() {
        window.open('/templates/CRP Import Template.xlsx', '_blank');
    }

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{
                        fontSize: { xs: '1.5rem', md: '2.125rem' }
                    }}>
                        🚀 Excel Import
                    </Typography>
                </Box>

                {/* Upload Section */}
                <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
                    <CardHeader
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CloudUpload color="primary" />
                                <Typography variant="h6">
                                    Upload Excel File
                                </Typography>
                            </Box>
                        }
                        sx={{
                            bgcolor: 'primary.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    />
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Box>
                                    {/* Ẩn input file mặc định */}
                                    <input
                                        accept=".xlsx,.xls"
                                        id="excel-file-input"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="excel-file-input" style={{ width: "100%" }}>
                                        <Button
                                            variant={selectedFile ? "contained" : "outlined"}
                                            component="span"
                                            startIcon={<CloudUpload />}
                                            sx={{
                                                fontWeight: 600,
                                                minHeight: 48,
                                                px: 3,
                                                boxShadow: 2,
                                                bgcolor: selectedFile ? 'success.main' : 'background.paper',
                                                color: selectedFile ? 'white' : 'inherit',
                                                '&:hover': {
                                                    boxShadow: 4,
                                                    bgcolor: selectedFile ? 'success.dark' : 'action.hover',
                                                },
                                                width: "100%",
                                                justifyContent: "flex-start",
                                                textTransform: "none"
                                            }}
                                            fullWidth={isMobile}
                                            size="large"
                                        >
                                            {selectedFile
                                                ? (
                                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", overflow: "hidden" }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 500,
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                flex: 1
                                                            }}
                                                            title={selectedFile.name}
                                                        >
                                                            {selectedFile.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                ml: 2,
                                                                color: "white",
                                                                fontWeight: 400,
                                                                fontSize: "0.85rem"
                                                            }}
                                                        >
                                                            (Change file)
                                                        </Typography>
                                                    </Box>
                                                )
                                                : "Select Excel file"
                                            }
                                        </Button>
                                    </label>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{ height: '100%' }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<CloudUpload />}
                                        onClick={onUpload}
                                        disabled={loading || !selectedFile}
                                        fullWidth={isMobile}
                                        size="large"
                                        sx={{
                                            minHeight: 48,
                                            boxShadow: 2,
                                            '&:hover': {
                                                boxShadow: 4,
                                            }
                                        }}
                                    >
                                        {loading ? "Uploading..." : "Upload"}
                                    </Button>

                                    <Tooltip
                                        title={hasErrors ? "Need to fix errors before approving" : ""}
                                        disableHoverListener={!hasErrors}
                                    >
                                        <span>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={onApprove}
                                                disabled={!details || hasErrors || approving}
                                                fullWidth={isMobile}
                                                size="large"
                                                sx={{
                                                    minHeight: 48,
                                                    boxShadow: 2,
                                                    '&:hover': {
                                                        boxShadow: 4,
                                                    }
                                                }}
                                            >
                                                {approving ? "Approving..." : "Approve"}
                                            </Button>
                                        </span>
                                    </Tooltip>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={onDownload}
                                        disabled={!details}
                                        fullWidth={isMobile}
                                        size="large"
                                    >
                                        Download Annotated
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<GetApp />}
                                        onClick={onDownloadTemplate}
                                        // disabled={!details}
                                        fullWidth={isMobile}
                                        size="large"
                                    >
                                        Download Template
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
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

                {/* Data Table Section */}
                {details && (
                    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                        <CardHeader
                            title={
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        📊 {details.fileName}
                                    </Typography>
                                    <Chip
                                        label={`Status: ${details.status}`}
                                        color="info"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            }
                            action={
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Chip
                                            label={`Total: ${details.totalRows}`}
                                            color="default"
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Valid: ${details.validRows}`}
                                            color="success"
                                            size="small"
                                        />
                                        <Chip
                                            label={`Error: ${details.invalidRows}`}
                                            color="error"
                                            size="small"
                                        />
                                    </Stack>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Rows per page</InputLabel>
                                        <Select
                                            label="Rows per page"
                                            value={pageSize}
                                            onChange={(e) => setPageSize(Number(e.target.value))}
                                        >
                                            {[10, 20, 50, 100].map((size) => (
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
                                                #
                                            </TableCell>
                                            {details.headers.map((header) => (
                                                <TableCell
                                                    key={header}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        minWidth: 120,
                                                        maxWidth: 200,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    <Tooltip title={header}>
                                                        <span>{header}</span>
                                                    </Tooltip>
                                                </TableCell>
                                            ))}
                                            <TableCell
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    minWidth: 200,
                                                }}
                                            >
                                                Error
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pageRows.map((row, index) => {
                                            const rowHasError = !row.isValid && (row.errors?.length ?? 0) > 0;
                                            return (
                                                <TableRow
                                                    key={`${row.rowNumber}-${index}`}
                                                    sx={{
                                                        bgcolor: rowHasError ? 'warning.light' : 'inherit',
                                                        '&:hover': {
                                                            bgcolor: rowHasError ? 'warning.main' : 'action.hover',
                                                        },
                                                        '&:last-child td': { border: 0 },
                                                    }}
                                                >
                                                    <TableCell
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            position: 'sticky',
                                                            left: 0,
                                                            bgcolor: rowHasError ? 'warning.light' : 'background.paper',
                                                            zIndex: 1000,
                                                            borderRight: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        {row.rowNumber}
                                                    </TableCell>
                                                    {details.headers.map((header) => (
                                                        <TableCell
                                                            key={header}
                                                            sx={{
                                                                maxWidth: 200,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            <Tooltip title={row.data?.[header] ?? ""}>
                                                                <span>{row.data?.[header] ?? ""}</span>
                                                            </Tooltip>
                                                        </TableCell>
                                                    ))}
                                                    <TableCell>
                                                        {rowHasError ? (
                                                            <Stack direction="column" spacing={0.5}>
                                                                {row.errors!.map((error, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        color="error"
                                                                        variant="filled"
                                                                        size="small"
                                                                        label={`${error.column}: ${error.message}`}
                                                                        sx={{
                                                                            fontSize: '0.75rem',
                                                                            height: 24,
                                                                            bgcolor: 'error.main',
                                                                            color: 'white',
                                                                            '&:hover': {
                                                                                bgcolor: 'error.dark',
                                                                            }
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        ) : (
                                                            <Chip
                                                                color="success"
                                                                variant="outlined"
                                                                size="small"
                                                                label="✓ OK"
                                                                sx={{ fontSize: '0.75rem', height: 24 }}
                                                            />
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
                                    Page {page} / {totalPages} • Total {details.rows.length} rows
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
                                        disabled={page === totalPages}
                                    >
                                        Next ›
                                    </Button>
                                    <Button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                    >
                                        Last »
                                    </Button>
                                </ButtonGroup>
                            </Box>

                            {hasErrors && (
                                <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>
                                    ⚠️ Have {details.invalidRows} invalid rows. Please fix the errors before approving.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Layout>
    );
}