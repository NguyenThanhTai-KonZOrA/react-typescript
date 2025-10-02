import React, { useState, useEffect } from "react";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../services/api";

const Login: React.FC = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/import-excel", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation cơ bản
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const response = await loginApi({ username, password });
      
      // Lưu token và user info vào localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", response.userName);
      
      console.log("Login success:", response);
      navigate("/import-excel", { replace: true });
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        minHeight="100vh" 
        justifyContent="center"
        sx={{ py: 4 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Đăng Nhập
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vui lòng đăng nhập để tiếp tục
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            margin="normal"
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            disabled={loading}
            autoComplete="username"
            autoFocus
          />
          <TextField
            required
            fullWidth
            margin="normal"
            type="password"
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
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
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng Nhập"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
