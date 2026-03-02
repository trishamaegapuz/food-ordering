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

  // --- LOGOUT LOGIC (IPINAREHAS SA DASHBOARD) ---
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
      const res = await axios.get('http://localhost:3000/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Connection Error");
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
      await axios.post('http://localhost:3000/api/admin/orders/status', 
        { order_id: orderId, new_status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchOrders();
    } catch (err) { alert('Update failed'); }
  };

  const handleLocationUpdate = async () => {
    try {
      await axios.post('http://localhost:3000/api/admin/orders/location',
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
    } catch (err) { alert('Location update failed'); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      <div className="flex-grow">
        
        {/* --- NAVIGATION --- */}
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
              <span className="text-[#e63946] text-2xl font-black">Food</span>
              <span className="text-[#1d3557] text-2xl font-black">Ordering</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/admin-dashboard')} className="text-slate-400 hover:text-blue-500 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500 transition-colors">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-slate-400 hover:text-blue-500 transition-colors">Menu</button>
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Orders</button>
            <button onClick={() => navigate('/admin/sales')} className="text-slate-400 hover:text-blue-500 transition-colors">Sales</button>
            <button onClick={handleLogoutClick} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors ml-4">
              Logout <LogOut size={16} />
            </button>
          </div>
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#1d3557] tracking-tight">Order Management</h1>
              <p className="text-slate-400 font-medium">Track, manage, and update real-time delivery statuses.</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><ClipboardList size={20}/></div>
               <span className="text-sm font-black text-slate-700">{orders.length} ACTIVE ORDERS</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic">Loading order logs...</div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {['pending', 'confirmed', 'preparing', 'delivering', 'delivered'].map(status => {
                const filteredOrders = orders.filter(o => o.status === status);
                if (filteredOrders.length === 0 && status !== 'pending') return null;

                return (
                  <section key={status} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <div className="flex items-center gap-3">
                         <StatusIcon status={status} />
                         <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">{status} Orders</h3>
                      </div>
                      <span className="bg-white px-4 py-1 rounded-xl text-[10px] font-black border border-slate-100 text-slate-400">
                        {filteredOrders.length} ITEMS
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
                          <tr>
                            <th className="px-8 py-5">ID</th>
                            <th className="px-8 py-5">Customer Details</th>
                            <th className="px-8 py-5">Total Amount</th>
                            <th className="px-8 py-5">Delivery Address</th>
                            <th className="px-8 py-5 text-center">Process Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6 font-mono text-xs text-slate-400">#{order.id}</td>
                              <td className="px-8 py-6">
                                <p className="font-black text-slate-700 text-sm">{order.full_name}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{order.email}</p>
                              </td>
                              <td className="px-8 py-6 font-black text-blue-600 text-sm">₱{Number(order.total).toLocaleString()}</td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium max-w-xs">
                                  <MapPin size={14} className="text-slate-300 shrink-0" />
                                  <span className="truncate">{order.delivery_address || 'No address provided'}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
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

      {/* --- FOOTER (IPINAREHAS SA DASHBOARD) --- */}
      <footer className="bg-[#1d3557] text-white py-6 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* --- UPDATE LOCATION MODAL --- */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-800 tracking-tight">Rider Tracking</h3>
              <button onClick={() => setShowUpdateModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Select Current Checkpoint</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none font-bold text-sm"
                    onChange={(e) => {
                      const loc = commonLocations.find(l => l.name === e.target.value);
                      setSelectedLocation(loc);
                    }}
                  >
                    <option value="">-- Choose Location --</option>
                    {commonLocations.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
               </div>

               <div className="h-40 bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                  <MapPin size={32} className="text-slate-300 mb-2" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Map Preview Area</p>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setShowUpdateModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
                  <button 
                    onClick={handleLocationUpdate}
                    disabled={!selectedLocation.name}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    Update Location
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL (IPINAREHAS SA DASHBOARD) --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6">
              <LogOut size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">Are you sure you want to end your session?</p>
            <div className="flex gap-4">
              <button onClick={cancelLogout} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Back</button>
              <button onClick={confirmLogout} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Logout Now</button>
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
    pending: <Clock className="text-yellow-500" size={20}/>,
    confirmed: <CheckCircle2 className="text-blue-500" size={20}/>,
    preparing: <Package className="text-orange-500" size={20}/>,
    delivering: <Truck className="text-purple-500" size={20}/>,
    delivered: <CheckCircle2 className="text-green-500" size={20}/>
  };
  return <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">{icons[status]}</div>;
};

const getNextStatus = (current) => {
  const flow = { pending: 'confirmed', confirmed: 'preparing', preparing: 'delivering', delivering: 'delivered' };
  return flow[current];
};

const ActionButtons = ({ status, onUpdate, onMap }) => {
  if (status === 'delivered') return <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1.5 rounded-lg uppercase">Completed</span>;

  return (
    <div className="flex justify-center gap-2">
      {status === 'delivering' && (
        <button onClick={onMap} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
          Track
        </button>
      )}
      <button onClick={onUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
        {status === 'pending' ? 'Confirm' : status === 'confirmed' ? 'Prepare' : status === 'preparing' ? 'Ship' : 'Finish'}
      </button>
    </div>
  );
};

export default AdminOrders;