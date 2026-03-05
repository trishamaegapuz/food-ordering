import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Search, 
  Image as ImageIcon, Loader2, AlertCircle, LogOut,
  Menu, Home, Users, ShoppingBag, ClipboardList, BarChart3, UserPlus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const AdminMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMenu();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/products/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null); 
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Hindi ma-delete ang item.");
      setItemToDelete(null);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Logout handlers
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
    setShowLogoutModal(false);
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
              active={true}
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
            onClick={() => setShowLogoutModal(true)}
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
            <p className="font-black text-slate-800">
              {user?.full_name || 'Admin'}
            </p>
          </div>
          <div className="text-right text-xs md:text-sm text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl whitespace-nowrap">
            {formatFullDate()}
          </div>
        </div>

        {/* MAIN CONTENT - Responsive padding */}
        <main className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1d3557] tracking-tight">Menu Management</h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Manage your restaurant items here.</p>
            </div>
            <button onClick={() => navigate('/admin/menu/add')} className="w-full md:w-auto bg-[#1d3557] text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all text-sm">
              <Plus size={18} /> Add New Item
            </button>
          </div>

          {/* --- Search and Filter - Responsive --- */}
          <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 mb-6 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text"
                placeholder="Search food name..."
                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Appetizers', 'Main Courses', 'Desserts', 'Beverages'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase transition-all whitespace-nowrap ${
                    filterCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-bold text-sm">Loading Menu...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl md:rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                  <div className="h-40 md:h-48 bg-slate-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon size={32} strokeWidth={1} />
                        <span className="text-[8px] font-bold uppercase mt-2">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md text-blue-600 font-black text-xs shadow-sm">
                      ₱{item.price}
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <span className="text-[8px] md:text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase mb-2 inline-block">
                      {item.category}
                    </span>
                    <h4 className="font-black text-slate-800 text-base md:text-lg mb-1 line-clamp-1">{item.name}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3 md:mb-4">{item.description}</p>
                    <div className="flex gap-2 pt-3 md:pt-4 border-t border-slate-50">
                      <button onClick={() => navigate(`/admin/menu/edit/${item.id}`)} className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 bg-slate-50 text-slate-600 font-bold rounded-lg md:rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all text-[10px] md:text-xs">
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => setItemToDelete(item)} className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-2.5 bg-slate-50 text-slate-600 font-bold rounded-lg md:rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-[10px] md:text-xs">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#1d3557] text-white py-4 md:py-6 text-center w-full mt-auto">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
        </footer>
      </div>

      {/* --- DELETE CONFIRMATION MODAL - Responsive --- */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl w-full max-w-[90%] md:max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 md:p-8 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <AlertCircle size={24} className="md:size-32" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1 tracking-tight">Delete Item?</h3>
              <p className="text-sm md:text-base text-slate-400 font-medium">Are you sure?</p>
            </div>
            <div className="p-4 md:p-6 bg-slate-50 flex flex-col md:flex-row gap-2 md:gap-3">
              <button onClick={() => setItemToDelete(null)} className="w-full md:flex-1 py-3 md:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="w-full md:flex-1 py-3 md:py-4 bg-red-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL - Responsive --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-[90%] md:max-w-sm p-6 md:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 md:p-5 bg-red-50 rounded-2xl md:rounded-3xl inline-block mb-4 md:mb-6">
              <LogOut size={32} className="md:size-48 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
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

export default AdminMenu;