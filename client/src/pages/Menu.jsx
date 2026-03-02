import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, X, Wallet, Truck, MapPin, Trash2, 
  CreditCard, ChevronRight, LogOut, Map, CheckCircle, AlertCircle, RefreshCw, ShoppingBag
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Fetch Products
    fetch('https://food-ordering-wq61.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setLoading(false);
      });
  }, [navigate]);

  const addToCart = (item) => {
    const exist = cart.find(x => x.id === item.id);
    if (exist) {
      setCart(cart.map(x => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    showNotification(`${item.name} added to cart!`);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20">
      {/* --- NOTIFICATION --- */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className={`px-6 py-3 rounded-full shadow-lg text-white font-bold flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            <CheckCircle size={18} /> {notification.message}
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <span className="text-red-500 text-2xl font-black italic">FAST</span>
          <span className="text-[#1d3557] text-2xl font-black">FOOD</span>
        </div>

        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search your favorite food..."
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowCart(true)} className="relative p-3 bg-white shadow-sm border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
            <ShoppingCart size={22} className="text-[#1d3557]" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((a, c) => a + c.qty, 0)}
              </span>
            )}
          </button>
          
          <div onClick={() => navigate('/profile')} className="cursor-pointer group">
            {user?.profile_picture ? (
              <img src={`https://food-ordering-wq61.onrender.com/uploads/${user.profile_picture}`} className="w-11 h-11 rounded-2xl object-cover border-2 border-transparent group-hover:border-red-500 transition-all" alt="Profile" />
            ) : (
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-red-200 transition-all">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <button onClick={() => setShowLogoutModal(true)} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="p-6 md:p-10">
        <div className="bg-[#1d3557] rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="relative z-10 max-w-lg">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">Free Delivery</span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">Fastest Food <br/> <span className="text-red-400">Delivery</span> in Town</h1>
            <p className="text-blue-100 text-lg mb-8">Get your favorite meals delivered to your doorstep in less than 30 minutes.</p>
            <button className="bg-white text-[#1d3557] px-8 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all shadow-lg">Order Now</button>
          </div>
          <ShoppingBag className="absolute -right-10 -bottom-10 text-white/10 w-80 h-80 rotate-12" />
        </div>
      </header>

      {/* --- CATEGORIES --- */}
      <section className="px-6 md:px-10 mb-8 overflow-x-auto flex gap-4 no-scrollbar">
        {['All', 'Appetizers', 'Main Courses', 'Desserts', 'Beverages'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* --- PRODUCTS GRID --- */}
      <main className="px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all group">
            <div className="h-48 rounded-[2rem] overflow-hidden mb-5 relative">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl font-black text-[#1d3557]">
                ₱{item.price}
              </div>
            </div>
            <h3 className="text-xl font-black text-[#1d3557] mb-2">{item.name}</h3>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{item.description}</p>
            <button 
              onClick={() => addToCart(item)}
              className="w-full py-4 bg-slate-50 text-[#1d3557] rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        ))}
      </main>

      {/* --- LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6 text-red-500"><LogOut size={48} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Logout?</h3>
            <p className="text-slate-400 font-medium mb-8">Are you sure you want to end your session?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Back</button>
              <button onClick={confirmLogout} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-red-200">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;