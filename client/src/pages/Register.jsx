import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '',
    role: 'customer'      // role dropdown restored
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (status.show) {
      const timer = setTimeout(() => {
        setStatus({ ...status, show: false });
        if (status.type === 'success') navigate('/login');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/register', formData);
      setStatus({ 
        show: true, 
        message: "Registration Successful! Redirecting to login...", 
        type: 'success' 
      });
    } catch (err) {
      setStatus({ 
        show: true, 
        message: err.response?.data?.message || "Registration Failed. Please try again.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      {status.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: status.type === 'success' ? '#2ecc71' : '#e74c3c'
        }}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ flex: 1, fontWeight: '600' }}>{status.message}</span>
          <X size={18} style={{ cursor: 'pointer' }} onClick={() => setStatus({ ...status, show: false })} />
        </div>
      )}

      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={styles.title}>Join Us</h2>
          <p style={styles.subtitle}>Create an account to start ordering</p>
          
          <form onSubmit={handleSubmit}>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Full Name" 
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              required 
            />
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Email Address" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
            <input 
              style={styles.input} 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
            
            {/* Role selection – restored */}
            <select 
              style={styles.input} 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>

            <button 
              style={{
                ...styles.button,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }} 
              type="submit"
              disabled={loading}
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> CREATING...</> : "SIGN UP"}
            </button>
          </form>
          
          <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

// Styles unchanged
const styles = {
  background: {
    backgroundImage: `url('https://wallpapers.com/images/featured/food-4k-spdnpz7bhmx4kv2r.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  toast: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    padding: '15px 25px',
    borderRadius: '12px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    minWidth: '320px',
    fontFamily: 'sans-serif'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '50px',
    borderRadius: '25px',
    width: '450px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  },
  title: { margin: '0', color: '#333', fontSize: '32px', fontWeight: '900' },
  subtitle: { color: '#666', marginBottom: '35px', fontSize: '16px', fontWeight: '500' },
  input: {
    width: '100%',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#fbfbfb'
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '18px',
    marginTop: '10px',
    boxShadow: '0 5px 15px rgba(230, 126, 34, 0.3)',
    transition: '0.3s'
  },
  footerText: { marginTop: '25px', fontSize: '15px', color: '#444' },
  link: { color: '#e67e22', textDecoration: 'none', fontWeight: 'bold' }
};

export default Register;