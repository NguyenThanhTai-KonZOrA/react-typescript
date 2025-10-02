import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import ImportExcel from "./pages/ImportExcel";
import ProtectedRoute from "./routes/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/import-excel" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/import-excel"
        element={
          <ProtectedRoute>
            <ImportExcel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

// import React from "react";
// import ImportExcelPage from "./pages/ImportExcel";
// import "bootstrap/dist/css/bootstrap.min.css";

// export default function App() {
//   return <ImportExcelPage />;
// }