import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Menu from "./pages/Menu"; 
import Profile from "./pages/Profile"; // <-- import Profile component
import AdminDashboard from "./pages/AdminDashboard";
import Users from './pages/Users';
import AdminMenu from './pages/AdminMenu';
import AddEditProduct from './pages/AddEditProduct';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';

// Helper component to protect admin pages
const ProtectedAdmin = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Routes */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/profile" element={<Profile />} /> {/* <-- new route */}

        {/* Admin Protected Routes */}
        <Route path="/admin-dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/users" element={<ProtectedAdmin><Users /></ProtectedAdmin>} />
        <Route path="/admin/menu" element={<ProtectedAdmin><AdminMenu /></ProtectedAdmin>} />
        <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />
        <Route path="/admin/menu/add" element={<ProtectedAdmin><AddEditProduct /></ProtectedAdmin>} />
        <Route path="/admin/menu/edit/:id" element={<ProtectedAdmin><AddEditProduct /></ProtectedAdmin>} />
        <Route path="/admin/sales" element={<ProtectedAdmin><AdminSales /></ProtectedAdmin>} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;