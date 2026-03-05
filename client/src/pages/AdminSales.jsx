import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, 
  Trash2, Download, LogOut, AlertCircle,
  Menu, Home, Users, ShoppingBag, ClipboardList, Plus, UserPlus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// FIX: Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const AdminSales = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ summary: {}, topItems: [], recentOrders: [] });
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null });
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/sales-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch sales error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) {
      fetchSalesData();
    }
  }, [user]);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowLogoutModal(false);
  };

  // --- UPDATED EXPORT CSV LOGIC ---
  const handleExport = () => {
    if (!data.recentOrders || data.recentOrders.length === 0) {
      alert("Walang data na pwedeng i-export.");
      return;
    }

    // Headers ng CSV
    const headers = ["Order ID", "Customer Name", "Total Amount (PHP)", "Status", "Date", "Time"];

    // Pag-convert ng data rows (nilagyan ng quotes para sa mga pangalan na may comma)
    const rows = data.recentOrders.map(order => {
      const dateObj = new Date(order.created_at);
      return [
        `#${order.id}`,
        `"${order.full_name}"`, // Nilagyan ng quotes para safe sa Excel
        order.total,
        order.status,
        dateObj.toLocaleDateString(),
        dateObj.toLocaleTimeString()
      ];
    });

    // Pagsasama ng headers at rows
    const csvContent = [
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Pag-create ng file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required para sa ilang browsers
    link.click();
    document.body.removeChild(link); // Linis pagkatapos i-download
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/orders/${deleteModal.orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeleteModal({ show: false, orderId: null });
      fetchSalesData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting record");
    }
  };

  const chartData = {
    labels: data.topItems.map(item => item.name),
    datasets: [{
      label: 'Quantity Sold',
      data: data.topItems.map(item => item.total_quantity),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 12,
    }]
  };

  // Format date to full format: "Thursday, March 5, 2026"
  const formatFullDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Navigation helper para sa sidebar
  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Sidebar Link Component
  const SidebarLink = ({ icon, label, active = false, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        active 
          ? 'bg-white/10 text-white' 
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
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
        {/* Sidebar Header - Fully clickable */}
        <div 
          onClick={() => navigateTo('/admin-dashboard')}
          className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
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
              onClick={() => navigateTo('/admin-dashboard')}
            />
            <SidebarLink 
              icon={<Users size={18} />} 
              label="Users" 
              onClick={() => navigateTo('/admin/users')}
            />
            <SidebarLink 
              icon={<ShoppingBag size={18} />} 
              label="Menu" 
              onClick={() => navigateTo('/admin/menu')}
            />
            <SidebarLink 
              icon={<ClipboardList size={18} />} 
              label="Orders" 
              onClick={() => navigateTo('/admin/orders')}
            />
            <SidebarLink 
              icon={<BarChart3 size={18} />} 
              label="Sales" 
              active={true}
              onClick={() => navigateTo('/admin/sales')}
            />
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8 px-4">
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-3 px-2">Quick Actions</p>
            <div className="space-y-1">
              <SidebarLink 
                icon={<Plus size={18} />} 
                label="Add Product" 
                onClick={() => navigateTo('/admin/menu/add')}
              />
              <SidebarLink 
                icon={<UserPlus size={18} />} 
                label="New User" 
                onClick={() => navigateTo('/admin/users/add')}
              />
            </div>
          </div>
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
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
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Welcome back,</p>
            <p className="font-black text-slate-800">
              {user?.full_name || 'Admin'}
            </p>
          </div>
          <div className="text-right text-xs md:text-sm text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl whitespace-nowrap">
            {formatFullDate()}
          </div>
        </div>

        {/* MAIN CONTENT - Responsive padding */}
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* Header and Export - stack on mobile */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1d3557] tracking-tight">Sales Analytics</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Detailed revenue reports and product performance.</p>
            </div>
            <button 
              onClick={handleExport} 
              className="w-full sm:w-auto bg-white border border-slate-200 px-4 sm:px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Download size={16} /> Export CSV Report
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic text-xs uppercase tracking-widest">Calculating revenue...</div>
          ) : (
            <>
              {/* STATS CARDS - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
                <SaleCard title="Daily Sales" value={data.summary.daily_sales || 0} icon={<TrendingUp size={24}/>} color="#ef4444" />
                <SaleCard title="Monthly Sales" value={data.summary.monthly_sales || 0} icon={<Calendar size={24}/>} color="#3b82f6" />
                <SaleCard title="Yearly Sales" value={data.summary.yearly_sales || 0} icon={<BarChart3 size={24}/>} color="#a855f7" />
                <SaleCard title="Total Sales" value={data.summary.total_sales || 0} icon={<DollarSign size={24}/>} color="#22c55e" />
              </div>

              {/* Chart and Recent Sales - responsive layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-10">
                <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 mb-4 sm:mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <BarChart3 className="text-blue-500" size={18} /> Top Performing Products
                  </h3>
                  <div className="h-[250px] sm:h-[350px]">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-4 sm:p-6 border-b border-slate-50">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Recent Sales</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left min-w-[500px]">
                        <tbody className="divide-y divide-slate-50 text-xs">
                          {data.recentOrders && data.recentOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <p className="font-black text-slate-700">{order.full_name}</p>
                                <p className="text-[10px] text-slate-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                <p className="font-black text-blue-600 mb-1">₱{Number(order.total).toLocaleString()}</p>
                                <button 
                                  onClick={() => setDeleteModal({ show: true, orderId: order.id })} 
                                  className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#1d3557] text-white py-4 md:py-6 text-center w-full mt-auto">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
        </footer>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] w-full max-w-[90%] sm:max-w-sm p-6 sm:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 bg-red-50 rounded-2xl sm:rounded-3xl inline-block mb-4 sm:mb-6">
              <AlertCircle size={36} className="sm:size-48 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">Remove Record?</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8">This action cannot be undone. Are you sure you want to delete this order?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => setDeleteModal({ show: false, orderId: null })} 
                className="w-full sm:flex-1 py-3 sm:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl sm:rounded-2xl cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={confirmDelete} 
                className="w-full sm:flex-1 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] w-full max-w-[90%] sm:max-w-sm p-6 sm:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 bg-red-50 rounded-2xl sm:rounded-3xl inline-block mb-4 sm:mb-6">
              <LogOut size={36} className="sm:size-48 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8">Are you sure you want to end your current session?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="w-full sm:flex-1 py-3 sm:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl sm:rounded-2xl cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={confirmLogout} 
                className="w-full sm:flex-1 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SaleCard component - responsive padding
const SaleCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-[2rem] shadow-sm border-b-4 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderBottomColor: color }}>
    <div>
      <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">{title}</p>
      <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-none">₱{Number(value).toLocaleString()}</h2>
    </div>
    <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50" style={{ color: color }}>{icon}</div>
  </div>
);

export default AdminSales;