import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Menu from './pages/Menu'; 
import AdminDashboard from './pages/AdminDashboard'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50"> 
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/Menu" element={<Menu />} />

         
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold text-orange-600">404</h1>
              <p className="text-gray-600">Opps! Hindi mahanap ang pahinang ito.</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Balik sa Login
              </button>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;