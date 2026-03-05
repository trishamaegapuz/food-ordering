import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LogOut, ClipboardList, MapPin, CheckCircle2, 
  Package, Truck, X, AlertTriangle, Clock
} from 'lucide-react';

// Marker Fix for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// FIX: Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const commonLocations = [
  { name: 'Restaurant Kitchen', lat: 17.6085, lng: 120.6320 },
  { name: 'Poblacion Area', lat: 17.6100, lng: 120.6350 },
  { name: 'On the Way', lat: 17.6130, lng: 120.6380 },
  { name: 'Near Destination', lat: 17.6160, lng: 120.6420 },
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateOrderId, setUpdateOrderId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ type: '', lat: '', lng: '', name: '' });

  // --- LOGOUT LOGIC ---
  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowLogoutModal(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Connection Error");
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.post(`${API_URL}/api/admin/orders/status`, 
        { order_id: orderId, new_status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchOrders();
    } catch (err) { 
      alert('Update failed'); 
    }
  };

  const handleLocationUpdate = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/orders/location`,
        { 
          order_id: updateOrderId, 
          latitude: selectedLocation.lat, 
          longitude: selectedLocation.lng, 
          location_name: selectedLocation.name 
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setShowUpdateModal(false);
      fetchOrders();
    } catch (err) { 
      alert('Location update failed'); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      <div className="flex-grow">
        
        {/* --- NAVIGATION - Responsive --- */}
        <nav className="bg-white border-b border-slate-100 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-xl sm:text-2xl font-black">Food</span>
            <span className="text-[#1d3557] text-xl sm:text-2xl font-black">Ordering</span>
          </div>
          {/* Scrollable nav links on mobile */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto pb-1 flex-nowrap ml-4 hide-scrollbar">
            <button onClick={() => navigate('/admin-dashboard')} className="text-slate-400 hover:text-blue-500 transition-colors whitespace-nowrap">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500 transition-colors whitespace-nowrap">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-slate-400 hover:text-blue-500 transition-colors whitespace-nowrap">Menu</button>
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 whitespace-nowrap">Orders</button>
            <button onClick={() => navigate('/admin/sales')} className="text-slate-400 hover:text-blue-500 transition-colors whitespace-nowrap">Sales</button>
            <button onClick={handleLogoutClick} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors whitespace-nowrap ml-2 sm:ml-4">
              Logout <LogOut size={14} className="sm:size-16" />
            </button>
          </div>
        </nav>

        {/* --- MAIN CONTENT - Responsive padding --- */}
        <main className="p-4 sm:p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1d3557] tracking-tight">Order Management</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Track, manage, and update real-time delivery statuses.</p>
            </div>
            <div className="bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg text-blue-500"><ClipboardList size={16} className="sm:size-20"/></div>
              <span className="text-xs sm:text-sm font-black text-slate-700">{orders.length} ACTIVE ORDERS</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic text-sm">Loading order logs...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-10">
              {['pending', 'confirmed', 'preparing', 'delivering', 'delivered'].map(status => {
                const filteredOrders = orders.filter(o => o.status === status);
                if (filteredOrders.length === 0 && status !== 'pending') return null;

                return (
                  <section key={status} className="bg-white rounded-xl sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <StatusIcon status={status} />
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs sm:text-sm">{status} Orders</h3>
                      </div>
                      <span className="bg-white px-3 sm:px-4 py-1 rounded-xl text-[8px] sm:text-[10px] font-black border border-slate-100 text-slate-400">
                        {filteredOrders.length} ITEMS
                      </span>
                    </div>

                    {/* Scrollable table on mobile */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[700px] sm:min-w-full">
                        <thead className="bg-slate-50/50 text-slate-400 uppercase text-[8px] sm:text-[10px] font-black tracking-[0.15em]">
                          <tr>
                            <th className="px-4 sm:px-8 py-3 sm:py-5">ID</th>
                            <th className="px-4 sm:px-8 py-3 sm:py-5">Customer Details</th>
                            <th className="px-4 sm:px-8 py-3 sm:py-5">Total</th>
                            <th className="px-4 sm:px-8 py-3 sm:py-5">Address</th>
                            <th className="px-4 sm:px-8 py-3 sm:py-5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-4 sm:px-8 py-4 sm:py-6 font-mono text-[10px] sm:text-xs text-slate-400">#{order.id}</td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6">
                                <p className="font-black text-slate-700 text-xs sm:text-sm">{order.full_name}</p>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">{order.email}</p>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 font-black text-blue-600 text-xs sm:text-sm">₱{Number(order.total).toLocaleString()}</td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6">
                                <div className="flex items-center gap-1 sm:gap-2 text-slate-500 text-[10px] sm:text-xs font-medium max-w-[120px] sm:max-w-xs">
                                  <MapPin size={12} className="text-slate-300 shrink-0" />
                                  <span className="truncate">{order.delivery_address || 'No address'}</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                                <ActionButtons 
                                  status={status} 
                                  onUpdate={() => handleStatusUpdate(order.id, getNextStatus(status))}
                                  onMap={() => { setUpdateOrderId(order.id); setShowUpdateModal(true); }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[#1d3557] text-white py-4 sm:py-6 text-center w-full">
        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* --- UPDATE LOCATION MODAL - Responsive --- */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-[95%] sm:max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 sm:p-8 border-b flex justify-between items-center">
              <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Rider Tracking</h3>
              <button onClick={() => setShowUpdateModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="sm:size-24" />
              </button>
            </div>
            <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
              <div>
                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Select Current Checkpoint</label>
                <select 
                  className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none font-bold text-xs sm:text-sm"
                  onChange={(e) => {
                    const loc = commonLocations.find(l => l.name === e.target.value);
                    if(loc) setSelectedLocation(loc);
                  }}
                >
                  <option value="">-- Choose Location --</option>
                  {commonLocations.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
              </div>

              <div className="h-32 sm:h-40 bg-slate-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                <MapPin size={24} className="sm:size-32 text-slate-300 mb-2" />
                <p className="text-[8px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">Map Preview Area</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={() => setShowUpdateModal(false)} className="w-full sm:flex-1 py-3 sm:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl sm:rounded-2xl">Cancel</button>
                <button 
                  onClick={handleLocationUpdate}
                  disabled={!selectedLocation.name}
                  className="w-full sm:flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  Update Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL - Responsive --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-[90%] sm:max-w-sm p-6 sm:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 sm:p-5 bg-red-50 rounded-2xl sm:rounded-3xl inline-block mb-4 sm:mb-6">
              <LogOut size={32} className="sm:size-48 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8 leading-relaxed">Are you sure you want to end your session?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={cancelLogout} className="w-full sm:flex-1 py-3 sm:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl sm:rounded-2xl">Back</button>
              <button onClick={confirmLogout} className="w-full sm:flex-1 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Logout Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatusIcon = ({ status }) => {
  const icons = {
    pending: <Clock className="text-yellow-500" size={18} />,
    confirmed: <CheckCircle2 className="text-blue-500" size={18} />,
    preparing: <Package className="text-orange-500" size={18} />,
    delivering: <Truck className="text-purple-500" size={18} />,
    delivered: <CheckCircle2 className="text-green-500" size={18} />
  };
  return <div className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100">{icons[status]}</div>;
};

const getNextStatus = (current) => {
  const flow = { pending: 'confirmed', confirmed: 'preparing', preparing: 'delivering', delivering: 'delivered' };
  return flow[current];
};

const ActionButtons = ({ status, onUpdate, onMap }) => {
  if (status === 'delivered') return <span className="text-[8px] sm:text-[10px] font-black text-green-500 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg uppercase">Completed</span>;

  return (
    <div className="flex justify-center gap-1 sm:gap-2">
      {status === 'delivering' && (
        <button onClick={onMap} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-800 text-white rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
          Track
        </button>
      )}
      <button onClick={onUpdate} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
        {status === 'pending' ? 'Confirm' : status === 'confirmed' ? 'Prepare' : status === 'preparing' ? 'Ship' : 'Finish'}
      </button>
    </div>
  );
};

export default AdminOrders;