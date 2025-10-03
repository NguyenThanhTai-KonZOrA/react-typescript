import React from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'grey.50',
                    minHeight: 'calc(100vh - 64px)', // Subtract header height
                }}
            >
                {children}
            </Box>
            
            {/* Footer */}
            <Footer />
        </Box>
    );
}
