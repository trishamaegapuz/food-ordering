import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/login', { username, password });
      if (res.data.success) {
        alert("Login Successful!");
        if (res.data.user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/menu');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Login");
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', marginTop:'50px' }}>
      <div style={{ border:'1px solid #ccc', padding:'20px', borderRadius:'8px', width:'300px' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input style={{width:'90%', marginBottom:'10px', padding:'8px'}} type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)} required />
          <input style={{width:'90%', marginBottom:'10px', padding:'8px'}} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required />
          <button style={{width:'100%', padding:'10px', backgroundColor:'#28a745', color:'white', border:'none'}} type="submit">Login</button>
        </form>
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};
export default Login;