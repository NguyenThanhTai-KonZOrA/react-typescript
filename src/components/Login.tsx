import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login: React.FC = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();

  useEffect(() => {
    if (token) {
      const from = (location.state as any)?.from?.pathname || "/import-excel";
      navigate(from, { replace: true });
    }
  }, [token, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await loginApi({ userName: username, password });
      login(response.userName, response.token);
      const from = (location.state as any)?.from?.pathname || "/import-excel";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 6,
            px: { xs: 2, sm: 4 },
            py: 4,
            bgcolor: "background.paper",
            width: "100%",
            maxWidth: 480,
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  bgcolor: "primary.main",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 2,
                  mb: 1,
                }}
              >
                <LockOutlinedIcon sx={{ color: "white", fontSize: 32 }} />
              </Box>
            }
            title={
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "primary.main",
                  mt: 1,
                }}
              >
                Sign in
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                Welcome back! Please Login to continue.
              </Typography>
            }
            sx={{ textAlign: "center", pb: 0 }}
          />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
                autoComplete="username"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                margin="normal"
                type={showPwd ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPwd((show) => !show)}
                        edge="end"
                        size="small"
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: 1,
                  boxShadow: 3,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
