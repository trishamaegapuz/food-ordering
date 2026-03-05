import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Users, ShoppingBag, Box, DollarSign, 
  Plus, UserPlus, Zap, TrendingUp, LogOut,
  Tag, ClipboardList, BarChart3, Clock,
  Menu, X, Home
} from 'lucide-react'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Filler, Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    total_sales: 0, 
    total_orders: 0, 
    total_users: 0, 
    total_products: 0,
    recentOrders: [],
    chartData: { labels: [], values: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('weekly');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const statsRes = await fetch(`https://food-ordering-wq61.onrender.com/api/admin/stats?view=${viewType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
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

  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
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
    <div className="min-h-screen flex bg-[#F8F9FC] font-sans text-slate-600">
      {/* Global styles */}
      <style>{`
        html, body {
          overflow-x: hidden !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-[#1d3557] text-white flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-xl font-black">Food</span>
            <span className="text-white text-xl font-black">Ordering</span>
          </div>
          <p className="text-xs text-white/50 mt-2 font-medium">Admin Dashboard</p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-1 px-4">
            <SidebarLink 
              icon={<Home size={18} />} 
              label="Dashboard" 
              active={true}
              onClick={() => {
                navigate('/admin-dashboard');
                setSidebarOpen(false);
              }}
            />
            <SidebarLink 
              icon={<Users size={18} />} 
              label="Users" 
              onClick={() => {
                navigate('/admin/users');
                setSidebarOpen(false);
              }}
            />
            <SidebarLink 
              icon={<ShoppingBag size={18} />} 
              label="Menu" 
              onClick={() => {
                navigate('/admin/menu');
                setSidebarOpen(false);
              }}
            />
            <SidebarLink 
              icon={<ClipboardList size={18} />} 
              label="Orders" 
              onClick={() => {
                navigate('/admin/orders');
                setSidebarOpen(false);
              }}
            />
            <SidebarLink 
              icon={<BarChart3 size={18} />} 
              label="Sales" 
              onClick={() => {
                navigate('/admin/sales');
                setSidebarOpen(false);
              }}
            />
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8 px-4">
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-3 px-2">Quick Actions</p>
            <div className="space-y-1">
              <SidebarLink 
                icon={<Plus size={18} />} 
                label="Add Product" 
                onClick={() => {
                  navigate('/admin/menu/add');
                  setSidebarOpen(false);
                }}
              />
              <SidebarLink 
                icon={<UserPlus size={18} />} 
                label="New User" 
                onClick={() => {
                  navigate('/admin/users/add');
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Bar with Hamburger Menu */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Welcome back,</p>
            <p className="font-black text-slate-800">Admin</p>
          </div>
          <div className="text-right text-xs md:text-sm text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl whitespace-nowrap">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#1d3557] tracking-tight">Dashboard Overview</h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium">Monitoring Food Ordering is now easier than ever.</p>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic text-sm">Loading dashboard data...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            <>
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-10">
                <StatCard title="Total Users" value={stats.total_users} icon={<Users size={20} className="md:size-24"/>} color="#3b82f6" onClick={() => navigate('/admin/users')} />
                <StatCard title="Total Orders" value={stats.total_orders} icon={<ShoppingBag size={20} className="md:size-24"/>} color="#22c55e" onClick={() => navigate('/admin/orders')} />
                <StatCard title="Total Products" value={stats.total_products} icon={<Box size={20} className="md:size-24"/>} color="#a855f7" onClick={() => navigate('/admin/menu')} />
                <StatCard title="Total Revenue" value={`₱${Number(stats.total_sales).toLocaleString()}`} icon={<DollarSign size={20} className="md:size-24"/>} color="#ef4444" onClick={() => navigate('/admin/sales')} />
              </div>

              {/* CHART AND QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-10">
                {/* SALES OVERVIEW CHART */}
                <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
                    <div>
                      <h3 className="font-black text-lg md:text-xl text-slate-800">Sales Overview</h3>
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                      <button 
                        onClick={() => setViewType('weekly')}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase transition-all ${viewType === 'weekly' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Weekly
                      </button>
                      <button 
                        onClick={() => setViewType('monthly')}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase transition-all ${viewType === 'monthly' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="h-[250px] md:h-[350px]">
                    {stats.chartData?.labels?.length > 0 ? (
                      <Line 
                        data={lineChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                            x: { grid: { display: false } }
                          }
                        }} 
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 italic text-xs md:text-sm">No sales data available</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* RECENT ORDERS */}
                  <div className="bg-white p-5 md:p-7 rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 h-[300px] md:h-[380px] flex flex-col">
                    <h3 className="font-black text-slate-800 mb-3 md:mb-4 flex items-center gap-2 text-base md:text-lg">
                      <Clock size={18} /> Recent Orders
                    </h3>
                    <div className="overflow-y-auto space-y-3 md:space-y-4 pr-2 flex-grow scrollbar-hide">
                      {stats.recentOrders?.length > 0 ? stats.recentOrders.map((order, idx) => (
                        <div key={idx} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <div className="bg-yellow-50 p-2 md:p-3 rounded-lg md:rounded-xl text-yellow-600">
                            <Clock size={16} className="md:size-20" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-black text-slate-800 text-xs md:text-sm truncate">Order #{order.id} ({order.status})</h4>
                            <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">
                              {order.full_name} • ₱{order.total} • {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 text-slate-300 italic text-xs md:text-sm">No recent orders</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MANAGEMENT SECTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <ManagementCard title="User Management" desc="Manage all users and permissions" icon={<Users className="text-blue-500" size={18}/>} borderColor="border-l-blue-500" onClick={() => navigate('/admin/users')} />
                <ManagementCard title="Menu Management" desc="Add, edit or remove menu items" icon={<Plus className="text-green-500" size={18}/>} borderColor="border-l-green-500" onClick={() => navigate('/admin/menu')} />
                <ManagementCard title="Sales Analytics" desc="View sales reports and trends" icon={<BarChart3 className="text-red-500" size={18}/>} borderColor="border-l-red-500" onClick={() => navigate('/admin/sales')} />
                <ManagementCard title="Order Log" desc="View and manage all orders" icon={<ClipboardList className="text-purple-500" size={18}/>} borderColor="border-l-purple-500" onClick={() => navigate('/admin/orders')} />
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#1d3557] text-white py-4 md:py-6 text-center w-full mt-auto">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
        </footer>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-[90%] md:max-w-sm p-6 md:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 md:p-5 bg-red-50 rounded-2xl md:rounded-3xl inline-block mb-4 md:mb-6">
              <LogOut size={32} className="md:size-48 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-6 md:mb-8">Are you sure you want to end your session?</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <button onClick={cancelLogout} className="w-full md:flex-1 py-3 md:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl">Back</button>
              <button onClick={confirmLogout} className="w-full md:flex-1 py-3 md:py-4 bg-red-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
      active 
        ? 'bg-white/10 text-white' 
        : 'text-white/60 hover:bg-white/10 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 md:p-7 rounded-xl md:rounded-[2rem] shadow-sm border-b-4 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group" style={{ borderBottomColor: color }}>
    <div>
      <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] mb-1 md:mb-2">{title}</p>
      <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">{value}</h2>
    </div>
    <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 group-hover:bg-white transition-colors shadow-inner" style={{ color: color }}>{icon}</div>
  </div>
);

// Management Card Component
const ManagementCard = ({ title, desc, icon, onClick, borderColor }) => (
  <div onClick={onClick} className={`bg-white p-4 md:p-6 rounded-xl md:rounded-[1.5rem] shadow-sm border border-slate-100 border-l-[4px] md:border-l-[6px] ${borderColor} flex items-center gap-3 md:gap-5 hover:border-blue-200 transition-all cursor-pointer group hover:shadow-md`}>
    <div className="p-2 md:p-4 bg-slate-50 rounded-lg md:rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <h4 className="font-black text-slate-800 text-xs md:text-base leading-tight mb-0.5 md:mb-1">{title}</h4>
      <p className="text-[9px] md:text-[11px] text-slate-400 font-bold leading-tight">{desc}</p>
    </div>
  </div>
);

export default AdminDashboard;