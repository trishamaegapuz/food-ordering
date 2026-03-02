import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Users, ShoppingBag, Box, DollarSign, 
  Plus, UserPlus, Zap, TrendingUp, LogOut,
  Tag, ClipboardList, BarChart3, Clock
} from 'lucide-react'; 
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Filler, Legend
);

// Palitan ito ng iyong Render URL sa .env file o dito mismo
const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    total_sales: 0, total_orders: 0, total_users: 0, total_products: 0,
    recentOrders: [], chartData: { labels: [], values: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('weekly');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const statsRes = await fetch(`${API_URL}/api/admin/stats?view=${viewType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error('Failed to fetch stats. Check if you are authorized.');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [viewType]);

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const lineChartData = {
    labels: stats.chartData?.labels || [],
    datasets: [{
      fill: true,
      label: 'Sales (₱)',
      data: stats.chartData?.values || [],
      borderColor: '#e63946',
      backgroundColor: 'rgba(230, 57, 70, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#e63946',
    }]
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
              <span className="text-[#e63946] text-2xl font-black">Food</span>
              <span className="text-[#1d3557] text-2xl font-black">Ordering</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-slate-400 hover:text-blue-500">Menu</button>
            <button onClick={() => navigate('/admin/orders')} className="text-slate-400 hover:text-blue-500">Orders</button>
            <button onClick={() => navigate('/admin/sales')} className="text-slate-400 hover:text-blue-500">Sales</button>
            <button onClick={() => setShowLogoutModal(true)} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold ml-4">
              Logout <LogOut size={16} />
            </button>
          </div>
        </nav>

        <main className="p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#1d3557] tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-400 font-medium">Monitoring Food Ordering is now easier than ever.</p>
            </div>
            <div className="text-right text-slate-400 text-sm font-bold bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic">Loading dashboard data...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Users" value={stats.total_users} icon={<Users size={24}/>} color="#3b82f6" onClick={() => navigate('/admin/users')} />
                <StatCard title="Total Orders" value={stats.total_orders} icon={<ShoppingBag size={24}/>} color="#22c55e" onClick={() => navigate('/admin/orders')} />
                <StatCard title="Total Products" value={stats.total_products} icon={<Box size={24}/>} color="#a855f7" onClick={() => navigate('/admin/menu')} />
                <StatCard title="Total Revenue" value={`₱${Number(stats.total_sales).toLocaleString()}`} icon={<DollarSign size={24}/>} color="#ef4444" onClick={() => navigate('/admin/sales')} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-slate-800">Sales Overview</h3>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {['weekly', 'monthly'].map((type) => (
                        <button key={type} onClick={() => setViewType(type)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewType === type ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[350px]">
                    {stats.chartData?.labels?.length > 0 ? (
                      <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 italic">No sales data available</div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-lg"><Zap size={20} className="text-yellow-500 fill-yellow-500" /> Quick Actions</h3>
                    <div className="space-y-4">
                      <ActionButton icon={<Plus size={18}/>} label="Add New Product" color="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => navigate('/admin/menu/add')} />
                      <ActionButton icon={<UserPlus size={18}/>} label="Create New User" color="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" onClick={() => navigate('/admin/users/add')} />
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 h-[380px] flex flex-col">
                    <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-lg">Recent Orders</h3>
                    <div className="overflow-y-auto space-y-4 pr-2 flex-grow">
                      {stats.recentOrders?.map((order, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100">
                          <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600"><Clock size={20} /></div>
                          <div className="flex-grow">
                            <h4 className="font-black text-slate-800 text-sm">Order #{order.id}</h4>
                            <p className="text-[11px] text-slate-400 font-bold uppercase">{order.full_name} • ₱{order.total}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

      <footer className="bg-[#1d3557] text-white py-6 text-center w-full mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6"><LogOut size={48} className="text-red-500" /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Confirm Logout?</h3>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Back</button>
              <button onClick={confirmLogout} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components remain same as your original design
const StatCard = ({ title, value, icon, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-7 rounded-[2rem] shadow-sm border-b-4 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group" style={{ borderBottomColor: color }}>
    <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{title}</p><h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2></div>
    <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors shadow-inner" style={{ color: color }}>{icon}</div>
  </div>
);

const ActionButton = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm ${color}`}>
    <span className="p-1.5 rounded-lg bg-white/20">{icon}</span> {label}
  </button>
);

export default AdminDashboard;