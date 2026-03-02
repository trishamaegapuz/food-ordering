import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, X, Wallet, Truck, MapPin, Trash2, 
  CreditCard, ChevronRight, LogOut, Map, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for map tracking
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingTab, setTrackingTab] = useState('active');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showTrackingMapModal, setShowTrackingMapModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);
  const [newAddress, setNewAddress] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gcashDetails, setGcashDetails] = useState({ mobile: '', name: '', reference: '' });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    setDeliveryAddress(userData.address || '');

    fetch('https://food-ordering-wq61.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));

    fetchOrders(userData.id);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`https://food-ordering-wq61.onrender.com/api/orders?user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    setShowLogoutModal(false);
  };

  const addToCart = (item) => {
    const exist = cart.find(x => x.id === item.id);
    if (exist) {
      setCart(cart.map(x => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    showNotification(`${item.name} added to cart`, 'success');
  };

  const calculateTotal = () => cart.reduce((total, item) => total + (item.price * item.qty), 0).toFixed(2);

  const submitOrder = async (paymentData) => {
    if (!deliveryAddress.trim()) {
      showNotification('Please enter a delivery address.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        items: cart.map(item => ({ id: item.id, price: item.price, quantity: item.qty })),
        payment_method: paymentMethod,
        payment_details: paymentData,
        delivery_address: deliveryAddress
      };
      const response = await fetch('https://food-ordering-wq61.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Order failed');
      setCart([]);
      setShowCheckoutModal(false);
      showNotification(`Order #${data.order_id} confirmed!`, 'success');
      fetchOrders(user.id);
      setShowTracking(true);
    } catch (error) {
      showNotification(`Payment failed: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'delivering'].includes(o.status));
  const historyOrders = orders.filter(o => ['delivered', 'canceled'].includes(o.status));

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* Navigation, Hero, Products Grid, and Sidebars would follow here based on full styling... */}
      <nav style={styles.nav}>
        <div onClick={() => navigate('/menu')}>
          <span style={{ color: '#e63946', fontWeight: '900' }}>Food</span>Ordering
        </div>
        <div style={styles.navLinks}>
          <div onClick={() => navigate('/profile')}>
             {user.profile_picture ? (
                <img src={`https://food-ordering-wq61.onrender.com/uploads/${user.profile_picture}`} alt="Profile" style={styles.avatarImg} />
             ) : (
                <div style={styles.avatar}>{user.full_name?.charAt(0)}</div>
             )}
          </div>
          <button onClick={handleLogoutClick}><LogOut /></button>
        </div>
      </nav>
      {/* ...Simplified for brevity... */}
    </div>
  );
};
export default Menu;