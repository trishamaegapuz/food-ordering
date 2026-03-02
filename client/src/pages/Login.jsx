import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  // Auto-hide notification
  useEffect(() => {
    if (status.show) {
      const timer = setTimeout(() => {
        setStatus({ ...status, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/login', { email, password });
      
      if (res.data.success) {
        setStatus({ show: true, message: "Login Successful! Redirecting...", type: 'success' });
        
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        } else {
          localStorage.setItem('token', 'authenticated_user'); 
        }

        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        setTimeout(() => {
          if (res.data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/menu');
          }
        }, 1500);
      }
    } catch (err) {
      setStatus({ 
        show: true, 
        message: err.response?.data?.message || "Invalid Login Credentials", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      {/* --- CUSTOM TOAST NOTIFICATION --- */}
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
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to order your favorite food</p>
          
          <form onSubmit={handleLogin}>
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              style={styles.input} 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
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
              {loading ? <><Loader2 size={20} className="animate-spin" /> VERIFYING...</> : "LOGIN"}
            </button>
          </form>
          
          <p style={styles.footerText}>
            New here? <Link to="/register" style={styles.link}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

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
    overflow: 'hidden',
    position: 'relative'
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
    animation: 'slideIn 0.5s ease-out',
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
    padding: '16px',
    marginBottom: '20px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#fbfbfb',
    transition: '0.2s'
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
    transition: '0.3s',
    boxShadow: '0 5px 15px rgba(230, 126, 34, 0.3)'
  },
  footerText: { marginTop: '25px', fontSize: '15px', color: '#444' },
  link: { color: '#e67e22', textDecoration: 'none', fontWeight: 'bold' }
};

export default Login;