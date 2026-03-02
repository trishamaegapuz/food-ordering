import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, ArrowLeft, Image as ImageIcon, 
  Upload, LogOut 
} from 'lucide-react';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Courses',
    image_url: ''
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

    if (isEdit) {
      axios.get(`http://localhost:3000/api/products`)
        .then(res => {
          const item = res.data.find(p => p.id === parseInt(id));
          if (item) setFormData(item);
        })
        .catch(err => console.error("Error fetching product:", err));
    }
  }, [id, isEdit, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (isEdit) {
        await axios.put(`http://localhost:3000/api/products/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:3000/api/products', formData, config);
      }
      navigate('/admin/menu');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error saving product");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      
      {/* Isinasama sa flex-grow para laging nasa baba ang footer */}
      <div className="flex-grow">
        {/* --- NAVIGATION BAR --- */}
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-2xl font-black">Food</span>
            <span className="text-[#1d3557] text-2xl font-black">Ordering</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/admin-dashboard')} className="text-slate-400 hover:text-blue-500 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/admin/users')} className="text-slate-400 hover:text-blue-500 transition-colors">Users</button>
            <button onClick={() => navigate('/admin/menu')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Menu</button>
            <button onClick={() => navigate('/admin/orders')} className="text-slate-400 hover:text-blue-500 transition-colors">Orders</button>
            <button onClick={() => navigate('/admin/sales')} className="text-slate-400 hover:text-blue-500 transition-colors">Sales</button>
            <button 
              onClick={handleLogoutClick}
              className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors ml-4"
            >
              Logout <LogOut size={16} />
            </button>
          </div>
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="p-8">
          <div className="max-w-2xl mx-auto mb-10">
            <button 
              onClick={() => navigate('/admin/menu')} 
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 font-bold transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Menu
            </button>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h2 className="text-3xl font-black text-[#1d3557] mb-8 tracking-tight">
                {isEdit ? 'Edit Dish' : 'Add New Dish'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center justify-center">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 w-full text-left">
                    Dish Photo
                  </label>
                  <div 
                    onClick={() => fileInputRef.current.click()} 
                    className="w-full h-64 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all overflow-hidden relative group"
                  >
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-bold flex items-center gap-2"><Upload size={20}/> Change Photo</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="bg-blue-50 text-blue-500 p-4 rounded-full inline-block mb-3">
                          <ImageIcon size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">Click to upload from computer</p>
                        <p className="text-slate-300 text-xs mt-1">PNG, JPG or JPEG (Max 2MB)</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Food Name</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Price (₱)</label>
                      <input 
                        type="number" required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option>Appetizers</option>
                        <option>Main Courses</option>
                        <option>Desserts</option>
                        <option>Beverages</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                    <textarea 
                      rows="3"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell something about this dish..."
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-[#1d3557] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-[#2a4a75] hover:scale-[1.01] transition-all active:scale-95">
                  <Save size={20} /> {isEdit ? 'Update Dish' : 'Add Dish'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1d3557] text-white py-6 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">© 2026 Food Ordering. All rights reserved.</p>
      </footer>

      {/* --- LOGOUT MODAL --- */}
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

export default AddEditProduct;