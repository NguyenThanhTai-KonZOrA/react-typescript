import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
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
    TablePagination,
    Stack,
    useTheme,
    useMediaQuery,
    Alert,
    AppBar,
    Toolbar
} from "@mui/material";
import { Home, ImportExport, Logout, Search, TableChart } from "@mui/icons-material";
import { settlementStatementSearch } from "../services/api";
import { SettlementStatementRequest, SettlementStatementResponse } from "../types";
import { useNavigate } from "react-router-dom";

export default function SearchProgramPage() {
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
    const navigate = useNavigate();
    // Pagination state
    const [page, setPage] = useState(0);
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
            setPage(0); // Reset về trang đầu khi tìm kiếm mới
        } catch (e: any) {
            setError(e.message || "Lỗi tìm kiếm");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
                ? Number(row.casinoWinLoss.replace(/,/g, ""))
                : Number(row.casinoWinLoss);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    }

    // Tính chi trả thưởng theo công thức
    function getAwardSettlement(total: number) {
        let percent = 0.05;
        if (total > 90000) percent = 0.12;
        else if (total > 30000) percent = 0.10;
        return Math.round(total * percent * 10) / 10; // Làm tròn 1 số thập phân
    }

    const totalWinLoss = getTotalWinLoss();
    const awardSettlement = getAwardSettlement(totalWinLoss);

    // Lấy dữ liệu trang hiện tại
    const pagedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Top Navigation Bar */}
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <TableChart sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Settlement Statement
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<ImportExport />}
                        onClick={() => navigate("/import-excel")}
                        sx={{ mr: 1 }}
                    >
                        Import Excel
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
            <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
                <Container maxWidth="xl">
                    {/* Search Section */}
                    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Search color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Tìm kiếm chương trình
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
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Người đại diện / Team Representative"
                                        name="representative"
                                        value={filters.representative}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Mã người đại diện / ID"
                                        name="representativeId"
                                        value={filters.representativeId}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Tên chương trình / Program Name"
                                        name="programName"
                                        value={filters.programName}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={6} md={1.5}>
                                    <TextField
                                        label="Ngày bắt đầu"
                                        name="dateStart"
                                        type="date"
                                        value={filters.dateStart}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={6} md={1.5}>
                                    <TextField
                                        label="Ngày kết thúc"
                                        name="dateEnd"
                                        type="date"
                                        value={filters.dateEnd}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: "primary.main",
                                            ":hover": { bgcolor: "primary.dark" },
                                            minWidth: 140,
                                            fontWeight: 600,
                                            mt: 1
                                        }}
                                        disabled={loading}
                                        fullWidth={isMobile}
                                        size="large"
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : "Tìm kiếm"}
                                    </Button>
                                </Grid>
                            </Grid>
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
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        📊 Kết quả tìm kiếm
                                    </Typography>
                                    <Chip
                                        label={`Tổng: ${results.length}`}
                                        color="default"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            }
                            sx={{
                                bgcolor: 'grey.50',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
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
                                                STT No.
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
                                                Mã thành viên / Member ID
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
                                                Tên thành viên / Member name
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
                                                Ngày gia nhập / Joined date
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
                                                Ngày cuối cùng / Last gaming date
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
                                                Đủ điều kiện / Eligible (Y/N)
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
                                                Casino thắng/(thua) / Casino win/(loss)
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pagedResults.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    Không có dữ liệu
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
                                                    {page * rowsPerPage + idx + 1}
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
                                    Trang {results.length === 0 ? 0 : page + 1} / {Math.max(1, Math.ceil(results.length / rowsPerPage))} • Tổng {results.length} dòng
                                </Typography>
                                <TablePagination
                                    component="div"
                                    count={results.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    labelRowsPerPage="Số dòng/trang"
                                    sx={{
                                        ".MuiTablePagination-toolbar": { justifyContent: "flex-end" }
                                    }}
                                />
                                <Box sx={{ mt: 2, px: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Tổng/Total: {totalWinLoss.toLocaleString()}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Chi trả thưởng/Award settlement: {awardSettlement.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </Box>
    );
}