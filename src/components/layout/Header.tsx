import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box
} from "@mui/material";
import { ImportExport, Logout, TableChart, Groups } from "@mui/icons-material";
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth(); // 👈 Use AuthContext logout

    // Handle logout - now triggers global logout
    const handleLogout = () => {
        console.log('🚪 Triggering global logout...');
        logout(); // This will trigger logout for all tabs
        navigate("/login");
    };

    // Determine page title based on current route
    const getPageTitle = () => {
        switch (location.pathname) {
            case "/import-excel":
                return "Excel Import System";
            case "/settlement-statement":
                return "Settlement Statement";
            case "/team-representatives":
                return "CRP Management";
            default:
                return "Excel Import System";
        }
    };

    return (
        <AppBar position="sticky" elevation={2} sx={{ top: 0, zIndex: 1100 }}>
            <Toolbar>
                <TableChart sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {getPageTitle()}
                </Typography>
                
                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {location.pathname !== "/import-excel" && (
                        <Button
                            color="inherit"
                            startIcon={<ImportExport />}
                            onClick={() => navigate("/import-excel")}
                            sx={{ mr: 1 }}
                        >
                            Import Excel
                        </Button>
                    )}
                    
                    {location.pathname !== "/settlement-statement" && (
                        <Button
                            color="inherit"
                            startIcon={<EqualizerIcon />}
                            onClick={() => navigate("/settlement-statement")}
                            sx={{ mr: 1 }}
                        >
                            Settlement Statement
                        </Button>
                    )}
                    
                    {location.pathname !== "/team-representatives" && (
                        <Button
                            color="inherit"
                            startIcon={<Groups />}
                            onClick={() => navigate("/team-representatives")}
                            sx={{ mr: 1 }}
                        >
                            Team Representatives
                        </Button>
                    )}
                    
                    <Button
                        color="inherit"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
