import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<h1 style={{textAlign:'center'}}>Admin Dashboard (Total Sales & Orders)</h1>} />
        <Route path="/menu" element={<h1 style={{textAlign:'center'}}>Customer Food Menu</h1>} />
      </Routes>
    </Router>
  );
}
export default App;