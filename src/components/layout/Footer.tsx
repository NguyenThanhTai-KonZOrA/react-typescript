import {
    Box,
    Container,
    Typography,
    Stack,
    useTheme
} from "@mui/material";
import { Copyright, Business, Email, Phone } from "@mui/icons-material";

export default function Footer() {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mt: 'auto',
                py: { xs: 3, md: 4 },
                borderTop: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Container maxWidth="xl">
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Copyright sx={{ fontSize: 16 }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {currentYear} The Grand Ho Tram. All rights reserved.
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
