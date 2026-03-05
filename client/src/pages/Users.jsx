import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, Edit, ShieldCheck, 
  UserCircle, LogOut, Users as UsersIcon, X, AlertTriangle,
  Menu, Home, ShoppingBag, ClipboardList, BarChart3, Plus, UserPlus
} from 'lucide-react';

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
      fetchUsers();
    } catch (err) {
      console.error("Error parsing user data:", err);
      navigate('/login');
    }
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
      setUsers(users.filter(u => u.id !== isDeletingUser));
      setIsDeletingUser(null);
    } catch (err) {
      alert("Error deleting user");
      setIsDeletingUser(null);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatFullDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const SidebarLink = ({ icon, label, active = false, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer relative z-50 ${
        active 
          ? 'bg-white/10 text-white shadow-sm' 
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F9FC] font-sans text-slate-600 relative overflow-x-hidden">
      
      {/* 1. FIXED: Mobile Sidebar Overlay - Added pointer-events-none when hidden */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[70]
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-[#1d3557] text-white flex flex-col shadow-2xl lg:shadow-none
      `}>
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

        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-1 px-4">
            <SidebarLink icon={<Home size={18} />} label="Dashboard" onClick={() => navigateTo('/admin-dashboard')} />
            <SidebarLink icon={<UsersIcon size={18} />} label="Users" active={true} onClick={() => navigateTo('/admin/users')} />
            <SidebarLink icon={<ShoppingBag size={18} />} label="Menu" onClick={() => navigateTo('/admin/menu')} />
            <SidebarLink icon={<ClipboardList size={18} />} label="Orders" onClick={() => navigateTo('/admin/orders')} />
            <SidebarLink icon={<BarChart3 size={18} />} label="Sales" onClick={() => navigateTo('/admin/sales')} />
          </div>

          <div className="mt-8 px-4">
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-3 px-2">Quick Actions</p>
            <div className="space-y-1">
              <SidebarLink icon={<Plus size={18} />} label="Add Product" onClick={() => navigateTo('/admin/menu/add')} />
              <SidebarLink icon={<UserPlus size={18} />} label="New User" onClick={() => navigateTo('/admin/users/add')} />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Welcome back,</p>
            <p className="font-black text-slate-800 truncate">
              {user?.full_name || 'Admin'}
            </p>
          </div>
          <div className="hidden sm:block text-right text-xs text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl">
            {formatFullDate()}
          </div>
        </header>

        <main className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#1d3557] tracking-tight">User Management</h1>
            <p className="text-sm text-slate-400 font-medium">Manage accounts and permissions.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Table Header Section */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <UsersIcon size={20} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Accounts</h3>
               </div>
               <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black">
                 {users.length} TOTAL USERS
               </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!loading && users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600">
                            {u.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{u.full_name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(u)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 cursor-pointer transition-all"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setIsDeletingUser(u.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 cursor-pointer transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-20 text-center text-slate-400 animate-pulse font-bold">Loading users...</div>}
            </div>
          </div>
        </main>
      </div>

      {/* MODALS (Siniguradong mataas ang z-index: z-[100]) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-800">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.full_name} 
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                placeholder="Full Name" required
              />
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                value={editFormData.email} 
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                placeholder="Email" required
              />
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-pointer"
                value={editFormData.role}
                onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full py-4 bg-[#1d3557] text-white rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer hover:bg-[#152a45]">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-400 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeletingUser(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;