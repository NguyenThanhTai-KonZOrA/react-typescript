// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./components/Login";
// import Home from "./pages/Home";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import { AuthProvider } from "./context/AuthContext";

// const App: React.FC = () => {
//   return (
//     <AuthProvider>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/Home"
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;

import React from "react";
import ImportExcelPage from "./pages/ImportExcel";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return <ImportExcelPage />;
}