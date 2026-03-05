import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, Edit, ShieldCheck, 
  UserCircle, LogOut, Users as UsersIcon, X, AlertTriangle,
  Menu, Home, ShoppingBag, ClipboardList, BarChart3, Plus, UserPlus
} from 'lucide-react';

/**
 * FIX: Gagamit tayo ng dynamic API_URL. 
 * Priority ang VITE_API_URL galing sa Vercel Environment Variables.
 */
const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const Users = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '', role: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${API_URL}/api/users/${editingUser.id}`, 
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success || response.status === 200) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert("Error updating user");
    }
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/users/${isDeletingUser}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== isDeletingUser));
      setIsDeletingUser(null);
    } catch (err) {
      alert("Error deleting user");
      setIsDeletingUser(null);
    }
  };

  // Logout handlers
  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
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
              active={true}
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
            <p className="font-black text-slate-800">
              {user?.full_name || 'Admin'}
            </p>
          </div>
          <div className="text-right text-xs md:text-sm text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl whitespace-nowrap">
            {formatFullDate()}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="p-4 md:p-8 max-w-[1200px] mx-auto w-full">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#1d3557] tracking-tight">User Management</h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium">View and manage all registered accounts and permissions.</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
            <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
              <div className="flex items-center gap-3 text-slate-700 font-bold">
                <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl">
                  <UsersIcon size={20} className="md:size-24 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-800 leading-tight">Registered Accounts</h3>
                  <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Database Records</p>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black shadow-sm border border-blue-100 whitespace-nowrap">
                {users.length} TOTAL USERS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px] md:min-w-full">
                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] md:text-[11px] font-bold tracking-widest">
                  <tr>
                    <th className="px-4 md:px-8 py-3 md:py-5">ID</th>
                    <th className="px-4 md:px-8 py-3 md:py-5">User Details</th>
                    <th className="px-4 md:px-8 py-3 md:py-5 text-center">Account Type</th>
                    <th className="px-4 md:px-8 py-3 md:py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!loading && users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 md:px-8 py-4 md:py-6 text-slate-400 font-mono text-[10px] md:text-xs">#{user.id}</td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black shadow-inner text-sm md:text-base">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-700 text-xs md:text-sm leading-none mb-1 md:mb-1.5 truncate">{user.full_name}</p>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-center">
                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase border ${
                          user.role === 'admin' ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {user.role === 'admin' ? <ShieldCheck size={10} className="md:size-12"/> : <UserCircle size={10} className="md:size-12"/>}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <div className="flex justify-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(user)} className="p-1.5 md:p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg md:rounded-xl border border-slate-100 bg-white shadow-sm transition-all">
                            <Edit size={14} className="md:size-18" />
                          </button>
                          <button onClick={() => setIsDeletingUser(user.id)} className="p-1.5 md:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg md:rounded-xl border border-slate-100 bg-white shadow-sm transition-all">
                            <Trash2 size={14} className="md:size-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {loading && (
                <div className="p-10 md:p-20 text-center flex flex-col items-center gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-slate-400 italic text-xs md:text-sm">Fetching user data...</p>
                </div>
              )}
              {!loading && users.length === 0 && (
                <div className="p-10 md:p-20 text-center">
                  <p className="font-bold text-slate-400 text-xs md:text-sm">No users found in database.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#1d3557] text-white py-4 md:py-6 text-center w-full mt-auto">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
        </footer>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-[95%] md:max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 md:p-8 border-b flex justify-between items-center">
              <h3 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="md:size-24" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 md:p-8 space-y-4 md:space-y-5">
              <div>
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 md:mb-2 block">Full Name</label>
                <input 
                  className="w-full p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                  value={editFormData.full_name} 
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 md:mb-2 block">Email Address</label>
                <input 
                  className="w-full p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 md:mb-2 block">Account Role</label>
                <select 
                  className="w-full p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none text-sm"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 md:py-4 bg-[#1d3557] text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg hover:bg-blue-900 transition-all mt-2 md:mt-4">
                Update Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingUser && (
        <div className="fixed inset-0 bg-red-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-[90%] md:max-w-sm p-6 md:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 md:p-5 bg-red-50 rounded-2xl md:rounded-3xl inline-block mb-4 md:mb-6">
              <AlertTriangle size={32} className="md:size-48 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">Delete User?</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-6 md:mb-8 leading-relaxed">This action cannot be undone.</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <button onClick={() => setIsDeletingUser(null)} className="w-full md:flex-1 py-3 md:py-4 font-black text-slate-400 uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl">Cancel</button>
              <button onClick={confirmDelete} className="w-full md:flex-1 py-3 md:py-4 bg-red-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-[90%] md:max-w-sm p-6 md:p-10 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 md:p-5 bg-red-50 rounded-2xl md:rounded-3xl inline-block mb-4 md:mb-6">
              <LogOut size={32} className="md:size-48 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium mb-6 md:mb-8">Are you sure?</p>
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

export default Users;