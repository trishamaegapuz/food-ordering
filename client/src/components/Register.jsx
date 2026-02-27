import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/register', formData);
      alert("Registration Successful!");
      navigate('/login');
    } catch (err) {
      alert("Registration Failed: " + (err.response?.data?.message || "Error"));
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', marginTop:'50px' }}>
      <div style={{ border:'1px solid #ccc', padding:'20px', borderRadius:'8px', width:'300px' }}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input style={{width:'90%', marginBottom:'10px', padding:'8px'}} type="text" placeholder="Username" onChange={(e)=>setFormData({...formData, username:e.target.value})} required />
          <input style={{width:'90%', marginBottom:'10px', padding:'8px'}} type="email" placeholder="Email" onChange={(e)=>setFormData({...formData, email:e.target.value})} required />
          <input style={{width:'90%', marginBottom:'10px', padding:'8px'}} type="password" placeholder="Password" onChange={(e)=>setFormData({...formData, password:e.target.value})} required />
          <button style={{width:'100%', padding:'10px', backgroundColor:'#007bff', color:'white', border:'none'}} type="submit">Register</button>
        </form>
        <p>Has account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;