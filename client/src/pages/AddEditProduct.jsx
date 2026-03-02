import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, ArrowLeft, Image as ImageIcon, 
  Upload, LogOut, CheckCircle, AlertCircle, X 
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
  
  // States para sa Design-based Notifications
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
        // Kung success ang add/edit, navigate pagkatapos ng toast
        if (notification.type === 'success' && notification.message.includes('successfully')) {
           navigate('/admin/menu');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const showCustomToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

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
      axios.get(`https://food-ordering-wq61.onrender.com/api/products`)
        .then(res => {
          const products = Array.isArray(res.data) ? res.data : [];
          const item = products.find(p => p.id === parseInt(id));
          if (item) {
            setFormData({
              name: item.name || '',
              description: item.description || '',
              price: item.price || '',
              category: item.category || 'Main Courses',
              image_url: item.image_url || ''
            });
          }
        })
        .catch(err => console.error("Error fetching product:", err));
    }
  }, [id, isEdit, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showCustomToast("File too large! Max 2MB only.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const submissionData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (isEdit) {
        await axios.put(`https://food-ordering-wq61.onrender.com/api/products/${id}`, submissionData, config);
        showCustomToast("Dish updated successfully!", "success");
      } else {
        await axios.post('https://food-ordering-wq61.onrender.com/api/products', submissionData, config);
        showCustomToast("New dish added successfully!", "success");
      }
      // Note: Ang navigation ay nasa useEffect ng notification para makita muna ang toast
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.error || "Error saving product.";
      showCustomToast(errMsg, "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      
      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {notification.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] shadow-2xl border ${
            notification.type === 'success' 
              ? 'bg-white border-green-100 text-green-600' 
              : 'bg-white border-red-100 text-red-600'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-black text-sm tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

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

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
              {/* Loading Overlay kapag nag-sa-save */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                   <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

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

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-[#1d3557] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-all ${isSubmitting ? 'opacity-50' : 'hover:bg-[#2a4a75] hover:scale-[1.01] active:scale-95'}`}
                >
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