import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Search, 
  Image as ImageIcon, Loader2, AlertCircle, LogOut
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const AdminMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

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
      alert(err.response?.data?.error || "Failed to delete item.");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans text-slate-600">
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-2xl font-black">Food</span>
            <span className="text-[#1d3557] text-2xl font-black">Ordering</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/admin-dashboard')} className="text-slate-400 hover:text-blue-500">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500">Users</button>
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Menu</button>
            <button onClick={() => setShowLogoutModal(true)} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold ml-4">Logout <LogOut size={16} /></button>
          </div>
        </nav>

        <main className="p-8 max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#1d3557]">Menu Management</h1>
              <p className="text-slate-400">Add or edit your delicious meals.</p>
            </div>
            <button onClick={() => navigate('/admin/menu/add')} className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20} /> Add New Item</button>
          </div>

          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search food name..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['All', 'Appetizers', 'Main Courses', 'Desserts', 'Beverages'].map((cat) => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-5 py-3 rounded-xl font-bold text-xs uppercase ${filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{cat}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mb-2" size={40} /><p className="font-bold">Loading Menu...</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                  <div className="h-48 bg-slate-100 relative">
                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>}
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-lg text-blue-600 font-black text-sm">₱{item.price}</div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">{item.category}</span>
                    <h4 className="font-black text-slate-800 text-lg mt-2">{item.name}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mt-1">{item.description}</p>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      <button onClick={() => navigate(`/admin/menu/edit/${item.id}`)} className="flex-1 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 text-xs flex items-center justify-center gap-1"><Edit size={14}/> Edit</button>
                      <button onClick={() => setItemToDelete(item)} className="flex-1 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 text-xs flex items-center justify-center gap-1"><Trash2 size={14}/> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      <footer className="bg-[#1d3557] text-white py-6 text-center w-full mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* Delete Modal Logic - Simplified for readability but keeps your design */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center shadow-2xl">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">Delete Item?</h3>
            <p className="text-slate-400 mb-6">Sure ka na bang tatanggalin si <span className="font-bold text-slate-700">{itemToDelete.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;