import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, X, Wallet, Truck, MapPin, Trash2, 
  CreditCard, ChevronRight, LogOut, Map, CheckCircle, AlertCircle, RefreshCw,
  User, Mail, Phone, Home, ArrowLeft
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

// Custom icons
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

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({ full_name: '', contact: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  // UI states
  const [showCart, setShowCart] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingTab, setTrackingTab] = useState('active');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart state (copied from Menu)
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [newAddress, setNewAddress] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gcashDetails, setGcashDetails] = useState({ mobile: '', name: '', reference: '' });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ ...notification, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // Fetch user and orders on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    setProfileForm({
      full_name: userData.full_name || '',
      contact: userData.contact || '',
      address: userData.address || ''
    });
    setDeliveryAddress(userData.address || '');
    fetchOrders(userData.id);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/orders?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Logout handlers
  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // Profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', profileForm.full_name);
      formData.append('contact', profileForm.contact);
      formData.append('address', profileForm.address);
      if (profilePicture) formData.append('profile_picture', profilePicture);

      const res = await fetch(`http://localhost:3000/api/user/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      showNotification('Profile updated successfully');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.new
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPasswordForm({ current: '', new: '', confirm: '' });
      showNotification('Password changed successfully');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm('WARNING: This will permanently delete your account and all your order history. This action cannot be undone. Are you sure you want to proceed?')) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Account deletion failed');
      localStorage.clear();
      navigate('/login?success=Account deleted');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map functions (from Menu)
  const showOrderOnMap = (order) => {
    setSelectedOrderForMap(order);
    setShowMapModal(true);
  };

  const getProgressWidth = (status) => {
    switch(status) {
      case 'pending':
      case 'confirmed': return '25%';
      case 'preparing': return '50%';
      case 'delivering': return '75%';
      case 'delivered': return '100%';
      default: return '25%';
    }
  };

  // Filter active/history (for tracking sidebar – same as Menu)
  const activeOrders = orders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'delivering'].includes(o.status)
  );
  const historyOrders = orders.filter(o => 
    ['delivered', 'canceled'].includes(o.status)
  );

  // Cart functions (from Menu)
  const addToCart = (item) => {
    const exist = cart.find(x => x.id === item.id);
    if (exist) {
      setCart(cart.map(x => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    showNotification(`${item.name} added to cart`, 'success');
  };
  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const updateQty = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };
  const calculateTotal = () => cart.reduce((total, item) => total + (item.price * item.qty), 0).toFixed(2);

  // Payment handlers (simplified)
  const handlePayment = () => { /* same as Menu */ };
  const handleGCashSubmit = (e) => { e.preventDefault(); /* ... */ };
  const handleCardSubmit = (e) => { e.preventDefault(); /* ... */ };
  const handleAddressSubmit = async (e) => { e.preventDefault(); /* ... */ };

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* Notification Toast */}
      {notification.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          minWidth: '300px', padding: '16px 20px', borderRadius: '12px',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
          <X size={18} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setNotification({ ...notification, show: false })} />
        </div>
      )}

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <div style={styles.contentWrapper}>
        {/* Navigation (identical to Menu) */}
        <nav style={styles.nav}>
          <div style={{...styles.logoGroup, cursor: 'pointer'}} onClick={() => navigate('/menu')}>
            <span style={{ color: '#e63946', fontSize: '26px', fontWeight: '900' }}>Food</span>
            <span style={{ color: '#1d3557', fontSize: '26px', fontWeight: '900' }}>Ordering</span>
          </div>

          <div style={styles.navLinks}>
            {/* Profile Section - now shows profile picture if available */}
            <div style={styles.profileSection} onClick={() => navigate('/menu')}>
              {user.profile_picture ? (
                <img 
                  src={`http://localhost:3000/uploads/${user.profile_picture}`} 
                  alt="Profile" 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={styles.avatar}>{user.full_name?.charAt(0).toUpperCase()}</div>
              )}
              <div style={{ textAlign: 'left', cursor: 'pointer' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{user.full_name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#457b9d' }}>Back to Menu</p>
              </div>
            </div>
            
            <div style={styles.trackOrder} onClick={() => setShowTracking(!showTracking)}>
              <MapPin size={18} color="#e63946" />
              <span>Track Order</span>
            </div>

            <div style={styles.cartIcon} onClick={() => setShowCart(!showCart)}>
              <ShoppingCart size={24} color="#1d3557" />
              {cart.length > 0 && <span style={styles.cartBadge}>{cart.reduce((sum, i) => sum + i.qty, 0)}</span>}
            </div>
            
            <button style={styles.navBtn} onClick={handleLogoutClick}>
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        {/* Back to Menu button (additional) */}
        <div style={{ padding: '20px 5% 0' }}>
          <button 
            onClick={() => navigate('/menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#1d3557',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <ArrowLeft size={18} /> Back to Menu
          </button>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6" style={{ maxWidth: '1200px' }}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            {/* Profile Picture & Basic Info */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img 
                  src={user.profile_picture ? `http://localhost:3000/uploads/${user.profile_picture}` : 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleProfileUpdate} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <input type="text" name="full_name" placeholder="Full Name" required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profileForm.full_name} onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                />
                <input type="text" name="contact" placeholder="Contact"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profileForm.contact} onChange={(e) => setProfileForm({...profileForm, contact: e.target.value})}
                />
                <textarea name="address" placeholder="Address" rows="3"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                />
                <input type="file" name="profile_picture" accept="image/*"
                  className="w-full p-3 border rounded-lg"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                />
                <button type="submit" disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50">
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <input type="password" name="current_password" placeholder="Current Password" required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                />
                <input type="password" name="new_password" placeholder="New Password" required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                />
                <input type="password" name="confirm_password" placeholder="Confirm New Password" required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                />
                <button type="submit" disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50">
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>

            {/* Delete Account Form */}
            <form onSubmit={handleDeleteAccount}>
              <h3 className="text-xl font-semibold mb-4 text-red-600">Delete Account</h3>
              <div className="space-y-4">
                <input type="password" name="password" placeholder="Enter your password to confirm" required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                />
                <button type="submit" disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  onClick={(e) => {
                    if (!window.confirm('WARNING: This will permanently delete your account and all your order history. This action cannot be undone. Are you sure you want to proceed?')) {
                      e.preventDefault();
                    }
                  }}>
                  {isSubmitting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '400px'}}>
            <div style={styles.modalHeader}>
              <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Confirm Logout</h2>
              <X size={24} style={{cursor: 'pointer'}} onClick={cancelLogout} />
            </div>
            <div style={{padding: '25px', textAlign: 'center'}}>
              <p style={{fontSize: '16px', color: '#333', marginBottom: '25px'}}>
                Are you sure you want to logout?
              </p>
              <div style={{display: 'flex', gap: '15px'}}>
                <button onClick={cancelLogout} style={{...styles.cancelBtn, flex: 1, padding: '12px'}}>Cancel</button>
                <button onClick={confirmLogout} style={{...styles.confirmOrderBtn, flex: 1, padding: '12px'}}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedOrderForMap && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '800px', width: '90%'}}>
            <div style={styles.modalHeader}>
              <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800'}}>Order #{selectedOrderForMap.id} Tracking</h2>
              <X size={24} style={{cursor: 'pointer'}} onClick={() => setShowMapModal(false)} />
            </div>
            <div style={{padding: '20px'}}>
              <div style={{height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px'}}>
                <MapContainer 
                  center={[selectedOrderForMap.dest_latitude || 14.5995, selectedOrderForMap.dest_longitude || 120.9842]} 
                  zoom={13} 
                  style={{height: '100%', width: '100%'}}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {selectedOrderForMap.dest_latitude && selectedOrderForMap.dest_longitude && (
                    <Marker 
                      position={[selectedOrderForMap.dest_latitude, selectedOrderForMap.dest_longitude]} 
                      icon={selectedOrderForMap.status === 'delivered' ? greenIcon : redIcon}
                    >
                      <Popup><b>Destination</b><br/>{selectedOrderForMap.dest_location_name || 'Customer Address'}</Popup>
                    </Marker>
                  )}
                  {selectedOrderForMap.status !== 'delivered' && selectedOrderForMap.latitude && selectedOrderForMap.longitude && (
                    <Marker position={[selectedOrderForMap.latitude, selectedOrderForMap.longitude]} icon={blueIcon}>
                      <Popup><b>Current Location</b><br/>{selectedOrderForMap.location_name || 'Rider position'}</Popup>
                    </Marker>
                  )}
                  {selectedOrderForMap.latitude && selectedOrderForMap.longitude && 
                   selectedOrderForMap.dest_latitude && selectedOrderForMap.dest_longitude && (
                    <Polyline 
                      positions={[[selectedOrderForMap.latitude, selectedOrderForMap.longitude], [selectedOrderForMap.dest_latitude, selectedOrderForMap.dest_longitude]]}
                      color="blue" weight={4} opacity={0.6} dashArray="10,10"
                    />
                  )}
                </MapContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong>🟦 Current Location:</strong><br/>
                  {selectedOrderForMap.location_name || 'Not available'}<br/>
                  {selectedOrderForMap.latitude ? `Lat: ${selectedOrderForMap.latitude}<br/>Lng: ${selectedOrderForMap.longitude}` : ''}
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong>🟩 Destination:</strong><br/>
                  {selectedOrderForMap.dest_location_name || selectedOrderForMap.delivery_address || 'Customer Address'}<br/>
                  Lat: {selectedOrderForMap.dest_latitude}<br/>Lng: {selectedOrderForMap.dest_longitude}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setShowMapModal(false)} className="px-4 py-2 border rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar – identical to Menu */}
      {showCart && (
        <div style={{...styles.sidebar, width: '380px'}}>
          <div style={styles.sidebarHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <ShoppingCart size={20} color="#e63946" />
              <h2 style={{margin: 0, fontSize: '18px'}}>Your Basket</h2>
            </div>
            <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowCart(false)} />
          </div>
          <div style={styles.sidebarContent}>
            {cart.length === 0 ? (
              <div style={{textAlign: 'center', marginTop: '100px', color: '#999'}}>
                <ShoppingCart size={50} style={{marginBottom: '15px', opacity: 0.2}} />
                <p>Your cart is empty.</p>
                <button style={styles.linkBtn} onClick={() => setShowCart(false)}>Go Shopping</button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={{flex: 1}}>
                    <p style={{margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '15px'}}>{item.name}</p>
                    <div style={styles.qtyControls}>
                      <button onClick={() => updateQty(item.id, -1)} style={styles.qtyBtn}>-</button>
                      <span style={{fontSize: '14px', fontWeight: 'bold'}}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={styles.qtyBtn}>+</button>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{margin: '0 0 5px 0', fontWeight: '900', color: '#e63946'}}>₱{(item.price * item.qty).toFixed(2)}</p>
                    <Trash2 size={16} color="#bbb" style={{cursor: 'pointer'}} onClick={() => removeFromCart(item.id)} />
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div style={styles.sidebarFooter}>
              <div style={styles.totalContainer}>
                <span style={{fontSize: '16px', color: '#666'}}>Subtotal:</span>
                <span style={{fontSize: '20px', fontWeight: '900', color: '#1d3557'}}>₱{calculateTotal()}</span>
              </div>
              <button style={styles.checkoutBtn} onClick={() => setShowCheckoutModal(true)}>
                Checkout Now <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tracking Sidebar – identical to Menu */}
      {showTracking && (
        <div style={{...styles.sidebar, width: '380px'}}>
          <div style={styles.sidebarHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Truck size={20} color="#e63946" />
              <h2 style={{margin: 0, fontSize: '18px'}}>Order Tracking</h2>
            </div>
            <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowTracking(false)} />
          </div>

          {/* Tab Buttons */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
            <button
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: trackingTab === 'active' ? 'bold' : 'normal',
                borderBottom: trackingTab === 'active' ? '2px solid #e63946' : 'none',
                color: trackingTab === 'active' ? '#e63946' : '#999'
              }}
              onClick={() => setTrackingTab('active')}
            >
              Active ({activeOrders.length})
            </button>
            <button
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: trackingTab === 'history' ? 'bold' : 'normal',
                borderBottom: trackingTab === 'history' ? '2px solid #e63946' : 'none',
                color: trackingTab === 'history' ? '#e63946' : '#999'
              }}
              onClick={() => setTrackingTab('history')}
            >
              History ({historyOrders.length})
            </button>
          </div>

          <div style={styles.sidebarContent}>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                <RefreshCw size={40} className="animate-spin" style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 15px', opacity: 0.7 }} />
                <p style={{ marginBottom: '10px' }}>Failed to load orders</p>
                <p style={{ fontSize: '12px', marginBottom: '15px' }}>{ordersError}</p>
                <button 
                  onClick={() => fetchOrders(user.id)}
                  style={{ backgroundColor: '#1d3557', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div style={{textAlign: 'center', marginTop: '50px', color: '#999'}}>
                <Map size={50} style={{marginBottom: '15px', opacity: 0.2}} />
                <p>No orders yet.</p>
                <p style={{fontSize: '13px'}}>Your orders will appear here.</p>
              </div>
            ) : (
              (trackingTab === 'active' ? activeOrders : historyOrders).map(order => (
                <div key={order.id} style={{border: '1px solid #eee', borderRadius: '12px', padding: '15px', marginBottom: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{fontWeight: 'bold'}}>Order #{order.id}</span>
                    <span style={{...styles.statusBadge, backgroundColor: order.status === 'delivered' ? '#d4edda' : '#fff3cd', color: order.status === 'delivered' ? '#155724' : '#856404'}}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{fontSize: '14px', color: '#666', marginBottom: '5px'}}>
                    Total: ₱{order.total}
                  </div>
                  {order.delivery_address && (
                    <div style={{fontSize: '13px', color: '#888', marginBottom: '10px'}}>
                      📍 {order.delivery_address}
                    </div>
                  )}
                  {/* Progress bar – only for active orders */}
                  {trackingTab === 'active' && (
                    <div style={{marginBottom: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                        <span>Placed</span>
                        <span>Preparing</span>
                        <span>On Way</span>
                        <span>Delivered</span>
                      </div>
                      <div style={{width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px'}}>
                        <div style={{width: getProgressWidth(order.status), height: '100%', backgroundColor: order.status === 'delivered' ? '#28a745' : '#e63946', borderRadius: '3px'}}></div>
                      </div>
                    </div>
                  )}
                  {/* Show current location for active undelivered orders */}
                  {trackingTab === 'active' && order.latitude && order.longitude && order.status !== 'delivered' && (
                    <div style={{backgroundColor: '#e7f3ff', padding: '8px', borderRadius: '8px', marginBottom: '10px'}}>
                      <div style={{fontSize: '12px', fontWeight: 'bold', color: '#0056b3'}}>Current Location:</div>
                      <div style={{fontSize: '12px'}}>{order.location_name || 'Updating...'}</div>
                    </div>
                  )}
                  {/* View on Map button removed */}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* UPDATED FOOTER – matches Users.jsx */}
      <footer className="bg-[#1d3557] text-white py-6 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' },
  contentWrapper: { flex: 1, position: 'relative' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 1001, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
  logoGroup: { display: 'flex', gap: '4px', alignItems: 'center' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '25px' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 10px', borderRadius: '30px', transition: '0.2s', ':hover': { backgroundColor: '#f5f5f5' } },
  avatar: { width: '38px', height: '38px', backgroundColor: '#e63946', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
  trackOrder: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#1d3557' },
  cartIcon: { position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#e63946', color: 'white', fontSize: '10px', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid #fff' },
  navBtn: { border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#e63946', display: 'flex', alignItems: 'center' },
  hero: { height: '260px', backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center' },
  heroTitle: { fontSize: '32px', marginBottom: '20px', fontWeight: '800', letterSpacing: '-0.5px' },
  searchBar: { display: 'flex', width: '90%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  searchInput: { flex: 1, padding: '12px 20px', border: 'none', outline: 'none', color: '#333', fontSize: '15px' },
  searchBtn: { backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '10px', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  categoryContainer: { display: 'flex', justifyContent: 'center', gap: '15px', padding: '25px 0', overflowX: 'auto' },
  catBtn: { padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: '0.3s', fontSize: '14px', whiteSpace: 'nowrap' },
  mainContainer: { display: 'flex', padding: '0 5% 40px 5%', position: 'relative' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px', transition: 'margin-right 0.3s ease' },
  card: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', transition: '0.3s', ':hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' } },
  imgContainer: { width: '100%', height: '180px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '20px' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#1d3557' },
  cardDesc: { color: '#777', fontSize: '13px', height: '36px', overflow: 'hidden', marginBottom: '15px', lineHeight: '1.4' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  priceTag: { fontSize: '20px', fontWeight: '900', color: '#e63946', margin: 0 },
  tag: { fontSize: '10px', backgroundColor: '#f1f3f5', padding: '4px 8px', borderRadius: '5px', color: '#666', fontWeight: 'bold' },
  cardActions: { display: 'flex', gap: '10px' },
  addBtn: { flex: 1, padding: '10px', borderRadius: '12px', border: '2px solid #e63946', color: '#e63946', backgroundColor: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '12px', transition: '0.2s' },
  buyBtn: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#e63946', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '12px', transition: '0.2s' },
  sidebar: { position: 'fixed', right: 0, top: '70px', width: '360px', height: 'calc(100vh - 70px)', backgroundColor: '#fff', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', zIndex: 1000, borderLeft: '1px solid #f0f0f0' },
  sidebarHeader: { padding: '25px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarContent: { flex: 1, overflowY: 'auto', padding: '20px' },
  cartItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #f8f8f8' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' },
  qtyBtn: { width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  sidebarFooter: { padding: '20px', borderTop: '1px solid #f5f5f5', backgroundColor: '#fff' },
  totalContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  checkoutBtn: { width: '100%', padding: '16px', borderRadius: '15px', border: 'none', backgroundColor: '#1d3557', color: '#fff', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(29,53,87,0.2)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#fff', borderRadius: '24px', width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
  modalHeader: { padding: '20px 25px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '25px' },
  modalSection: { marginBottom: '25px' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '15px', color: '#1d3557', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
  modalItemList: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '15px' },
  modalItemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' },
  modalTotalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: '2px dashed #eee', marginBottom: '20px' },
  addressBox: { display: 'flex', gap: '15px', padding: '18px', backgroundColor: '#fff', borderRadius: '15px', border: '1.5px solid #eee', cursor: 'pointer' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  radioOption: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', border: '1.5px solid #eee', borderRadius: '15px', cursor: 'pointer', transition: '0.2s' },
  hiddenRadio: { cursor: 'pointer' },
  modalFooter: { padding: '0 25px 25px 25px', display: 'flex', gap: '15px' },
  cancelBtn: { flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '700', color: '#666' },
  confirmOrderBtn: { flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#e63946', color: '#fff', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 15px rgba(230,57,70,0.3)', ':disabled': { opacity: 0.6 } },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px' },
  linkBtn: { background: 'none', border: 'none', color: '#457b9d', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px' },
  simpleFooter: { backgroundColor: '#fff', color: '#999', padding: '20px', textAlign: 'center', borderTop: '1px solid #f0f0f0', fontSize: '13px' },
  statusBadge: { padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
};

export default Profile;