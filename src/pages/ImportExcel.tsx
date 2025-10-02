import React, { useEffect, useMemo, useState } from "react";
import { approveBatch, downloadAnnotated, getBatchDetails, uploadExcel } from "../services/api";
import { ImportDetailsResponse } from "../types";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    AppBar,
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
    Toolbar,
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
    GetApp,
    Logout,
    TableChart,
} from "@mui/icons-material";
import EqualizerIcon from '@mui/icons-material/Equalizer';

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
    const [pageSize, setPageSize] = useState(20);

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
            setError("Vui lòng chọn file (.xlsx).");
            return;
        }
        setLoading(true);
        try {
            const summary = await uploadExcel(selectedFile);
            const full = await getBatchDetails(summary.batchId);
            setDetails(full);
            setSuccess("Upload thành công.");
        } catch (e: any) {
            setError(e.message || "Upload thất bại.");
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
            setSuccess(`Approved thành công. Settlements: ${res.settlementsInserted}`);
            const refreshed = await getBatchDetails(details.batchId);
            setDetails(refreshed);
        } catch (e: any) {
            setError(e.message || "Approve thất bại.");
        } finally {
            setApproving(false);
        }
    }

    async function onDownload() {
        setError(null);
        setSuccess(null);
        try {
            if (!details) throw new Error("Không có batch.");
            await downloadAnnotated(details.batchId);
        } catch (e: any) {
            setError(e.message || "Download thất bại.");
        }
    }

    async function onDownloadTemplate() {
        window.open('templates/CRP Import Template.xlsx', '_blank');
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Top Navigation Bar */}
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <TableChart sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Excel Import System
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<EqualizerIcon  />}
                        onClick={() => navigate("/settlement-statement")}
                        sx={{ mr: 1 }}
                    >
                        Settlement Statement
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

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
                                    <TextField
                                        fullWidth
                                        type="file"
                                        inputProps={{ accept: ".xlsx,.xls" }}
                                        onChange={handleFileChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.paper',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }
                                        }}
                                    />
                                    {selectedFile && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 1,
                                                display: 'block',
                                                color: 'success.main',
                                                fontWeight: 'medium'
                                            }}
                                        >
                                            📎 Đã chọn: {selectedFile.name}
                                        </Typography>
                                    )}
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
                                        {loading ? "Đang upload..." : "Upload"}
                                    </Button>

                                    <Tooltip
                                        title={hasErrors ? "Cần giải quyết lỗi trước khi approve" : ""}
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
                                                {approving ? "Đang approve..." : "Approve"}
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
                                            label={`Tổng: ${details.totalRows}`}
                                            color="default"
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Hợp lệ: ${details.validRows}`}
                                            color="success"
                                            size="small"
                                        />
                                        <Chip
                                            label={`Lỗi: ${details.invalidRows}`}
                                            color="error"
                                            size="small"
                                        />
                                    </Stack>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Số dòng/trang</InputLabel>
                                        <Select
                                            label="Số dòng/trang"
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
                                                Lỗi
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pageRows.map((row) => {
                                            const rowHasError = !row.isValid && (row.errors?.length ?? 0) > 0;
                                            return (
                                                <TableRow
                                                    key={row.rowNumber}
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
                                    Trang {page} / {totalPages} • Tổng {details.rows.length} dòng
                                </Typography>
                                <ButtonGroup variant="outlined" size="small">
                                    <Button
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                    >
                                        « Đầu
                                    </Button>
                                    <Button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        ‹ Trước
                                    </Button>
                                    <Button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Sau ›
                                    </Button>
                                    <Button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                    >
                                        Cuối »
                                    </Button>
                                </ButtonGroup>
                            </Box>

                            {hasErrors && (
                                <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>
                                    ⚠️ Có {details.invalidRows} dòng không hợp lệ. Cần sửa lỗi trước khi approve.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Box>
    );
}