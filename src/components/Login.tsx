import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { loginApi } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login } = useAuth(); // từ AuthContext
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginApi(username, password);
      login(data.userName, data.token); 
      console.log("Login success:", data);
      navigate("/Home", { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" minHeight="100vh" justifyContent="center">
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
          required
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
          <TextField
          required
            fullWidth
            margin="normal"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
