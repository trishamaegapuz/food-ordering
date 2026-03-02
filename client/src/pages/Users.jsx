import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, Edit, ShieldCheck, 
  UserCircle, LogOut, Users as UsersIcon, X, AlertTriangle 
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '', role: '' });
  const navigate = useNavigate();

  // --- LOGOUT LOGIC ---
  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setShowLogoutModal(false);
  };

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
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
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
        `http://localhost:3000/api/users/${editingUser.id}`, 
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
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
      await axios.delete(`http://localhost:3000/api/users/${isDeletingUser}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== isDeletingUser));
      setIsDeletingUser(null);
    } catch (err) {
      alert("Error deleting user");
      setIsDeletingUser(null);
    }
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
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-slate-400 hover:text-blue-500 transition-colors">Menu</button>
            <button onClick={() => navigate('/admin/orders')} className="text-slate-400 hover:text-blue-500 transition-colors">Orders</button>
            <button onClick={() => navigate('/admin/sales')} className="text-slate-400 hover:text-blue-500 transition-colors">Sales</button>
            <button onClick={handleLogoutClick} className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors font-bold ml-4">
              Logout <LogOut size={16} />
            </button>
          </div>
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="p-8 max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#1d3557] tracking-tight">User Management</h1>
            <p className="text-slate-400 font-medium">View and manage all registered accounts and permissions.</p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
            {/* Table Header Section */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3 text-slate-700 font-bold">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <UsersIcon size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">Registered Accounts</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Database Records</p>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-600 px-5 py-2 rounded-2xl text-xs font-black shadow-sm border border-blue-100">
                {users.length} TOTAL USERS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[11px] font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">User Details</th>
                    <th className="px-8 py-5 text-center">Account Type</th>
                    <th className="px-8 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 text-slate-400 font-mono text-xs">#{user.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black shadow-inner">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-700 text-sm leading-none mb-1.5">{user.full_name}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                          user.role === 'admin' ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {user.role === 'admin' ? <ShieldCheck size={12}/> : <UserCircle size={12}/>}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(user)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-100 bg-white shadow-sm transition-all">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => setIsDeletingUser(user.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 bg-white shadow-sm transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-20 text-center font-bold text-slate-400 italic">Fetching user data...</div>}
              {!loading && users.length === 0 && <div className="p-20 text-center font-bold text-slate-400">No users found in database.</div>}
            </div>
          </div>
        </main>
      </div>

      {/* --- UPDATED FOOTER (PAREHAS SA DASHBOARD) --- */}
      <footer className="bg-[#1d3557] text-white py-6 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* --- MODALS --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-800 tracking-tight">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Full Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  value={editFormData.full_name} 
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Email Address</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Account Role</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-[#1d3557] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-900 transition-all mt-4">
                Update Account
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeletingUser && (
        <div className="fixed inset-0 bg-red-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Delete User?</h3>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">This action cannot be undone. All user data will be removed from the system.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeletingUser(null)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl">
            <div className="p-5 bg-red-50 rounded-3xl inline-block mb-6">
              <LogOut size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Confirm Logout?</h3>
            <p className="text-slate-400 font-medium mb-8">Are you sure you want to end your current session?</p>
            <div className="flex gap-4">
              <button onClick={cancelLogout} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Back</button>
              <button onClick={confirmLogout} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;