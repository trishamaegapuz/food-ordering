import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, DollarSign, Calendar, 
  Trash2, Download, LogOut, AlertCircle
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

const AdminSales = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, topItems: [], recentOrders: [] });
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null });

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/admin/sales-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalesData(); }, []);

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const handleExport = () => {
    if (data.recentOrders.length === 0) return;
    const headers = ["Order ID", "Customer Name", "Total Amount", "Status", "Date"];
    const rows = data.recentOrders.map(order => [
      order.id, order.full_name, order.total, order.status, 
      new Date(order.created_at).toLocaleString()
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/orders/${deleteModal.orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeleteModal({ show: false, orderId: null });
      fetchSalesData();
    } catch (err) {
      console.error("Delete failed", err);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      <div className="flex-grow">
        {/* NAVIGATION */}
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-2xl font-black">Food</span>
            <span className="text-[#1d3557] text-2xl font-black">Ordering</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/admin-dashboard')} className="text-slate-400 hover:text-blue-500 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500 transition-colors">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-slate-400 hover:text-blue-500 transition-colors">Menu</button>
            <button onClick={() => navigate('/admin/orders')} className="text-slate-400 hover:text-blue-500 transition-colors">Orders</button>
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Sales</button>
            <button onClick={() => setShowLogoutModal(true)} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors ml-4">
              Logout <LogOut size={16} />
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-3xl font-black text-[#1d3557] tracking-tight">Sales Analytics</h1>
              <p className="text-slate-400 font-medium">Detailed revenue reports and product performance.</p>
            </div>
            <button onClick={handleExport} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              <Download size={16} /> Export CSV Report
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 italic text-sm uppercase tracking-widest">Calculating revenue...</div>
          ) : (
            <>
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SaleCard title="Daily Sales" value={data.summary.daily_sales} icon={<TrendingUp size={24}/>} color="#ef4444" />
                <SaleCard title="Monthly Sales" value={data.summary.monthly_sales} icon={<Calendar size={24}/>} color="#3b82f6" />
                <SaleCard title="Yearly Sales" value={data.summary.yearly_sales} icon={<BarChart3 size={24}/>} color="#a855f7" />
                <SaleCard title="Total Sales" value={data.summary.total_sales} icon={<DollarSign size={24}/>} color="#22c55e" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <BarChart3 className="text-blue-500" size={18} /> Top Performing Products
                  </h3>
                  <div className="h-[350px]">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-50">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Recent Sales</h3>
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {data.recentOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-black text-slate-700">{order.full_name}</p>
                              <p className="text-[10px] text-slate-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="font-black text-blue-600 mb-1">₱{Number(order.total).toLocaleString()}</p>
                              <button 
                                onClick={() => setDeleteModal({ show: true, orderId: order.id })} 
                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
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
            </>
          )}
        </main>
      </div>

      <footer className="bg-[#1d3557] text-white py-6 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* --- MODALS (UNIFIED DESIGN) --- */}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Remove Record?</h3>
            <p className="text-slate-400 font-medium mb-8">This action cannot be undone. Are you sure you want to delete this order?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModal({ show: false, orderId: null })} 
                className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]"
              >
                Back
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL (MATCHED TO DASHBOARD) */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6">
              <LogOut size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-slate-400 font-medium mb-8">Are you sure you want to end your current session?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]"
              >
                Back
              </button>
              <button 
                onClick={confirmLogout} 
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200"
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

const SaleCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-7 rounded-[2rem] shadow-sm border-b-4 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderBottomColor: color }}>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">₱{Number(value).toLocaleString()}</h2>
    </div>
    <div className="p-4 rounded-2xl bg-slate-50" style={{ color: color }}>{icon}</div>
  </div>
);

export default AdminSales;