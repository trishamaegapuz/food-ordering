import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, ArrowLeft, Image as ImageIcon, 
  Upload, LogOut, CheckCircle, AlertCircle, X, ChevronRight 
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
        setErrorMessage("File is too large! Max 2MB only.");
        return;
      }
      setErrorMessage('');
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image_url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      };

      const submissionData = { ...formData, price: parseFloat(formData.price) };

      if (isEdit) {
        await axios.put(`https://food-ordering-wq61.onrender.com/api/products/${id}`, submissionData, config);
      } else {
        await axios.post('https://food-ordering-wq61.onrender.com/api/products', submissionData, config);
      }
      
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] font-sans text-slate-600">
      
      <div className="flex-grow">
        {/* --- NAVBAR - Responsive --- */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/admin-dashboard')}>
            <span className="text-[#e63946] text-xl sm:text-2xl font-black italic">FAST</span>
            <span className="text-[#1d3557] text-xl sm:text-2xl font-black">FOOD</span>
          </div>
          {/* Scrollable nav links on mobile */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1 flex-nowrap ml-4 hide-scrollbar">
            {['Dashboard', 'Users', 'Menu', 'Orders', 'Sales'].map((item) => (
              <button 
                key={item}
                onClick={() => navigate(`/admin/${item.toLowerCase()}`)}
                className={`${item === 'Menu' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'} hover:text-blue-500 transition-all pb-1 whitespace-nowrap`}
              >
                {item}
              </button>
            ))}
            <button onClick={handleLogoutClick} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all flex-shrink-0">
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <main className="p-4 sm:p-8 max-w-4xl mx-auto">
          <button onClick={() => navigate('/admin/menu')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 sm:mb-8 font-bold group transition-all">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft size={16} className="sm:size-18" />
            </div>
            Back to Menu
          </button>

          {/* Grid - stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Form Side */}
            <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-white">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1d3557] mb-6 sm:mb-8 tracking-tight flex items-center gap-3">
                {isEdit ? 'Update Dish' : 'New Dish'}
                <div className="h-1 w-8 sm:w-12 bg-blue-500 rounded-full mt-2"></div>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 ml-1">Dish Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-bold text-sm sm:text-base text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 ml-1">Price (₱)</label>
                      <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full p-3 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-bold text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 ml-1">Category</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-bold text-sm sm:text-base appearance-none"
                      >
                        {['Appetizers', 'Main Courses', 'Desserts', 'Beverages'].map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 ml-1">Description</label>
                    <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 sm:p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-medium text-sm sm:text-base"
                    ></textarea>
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 bg-[#1d3557] text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 hover:bg-[#2a4a75] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  {isSubmitting ? <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} className="sm:size-20" /> {isEdit ? 'Save Changes' : 'Publish Dish'}</>}
                </button>
              </form>
            </div>

            {/* Photo Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-6 shadow-xl border border-white">
                <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 mb-3 sm:mb-4 block">Product Preview</label>
                <div onClick={() => fileInputRef.current.click()} 
                  className="aspect-square rounded-2xl sm:rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all overflow-hidden relative group"
                >
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-center p-4">
                      <div className="bg-blue-50 text-blue-500 p-3 sm:p-4 rounded-full inline-block mb-2"><ImageIcon size={24} className="sm:size-30" /></div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400">Click to upload</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <p className="text-[10px] text-slate-400 mt-2 text-center">Max file size: 2MB</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- SUCCESS MODAL - Responsive --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#1d3557]/40 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div className="relative bg-white rounded-3xl sm:rounded-[3rem] w-full max-w-[90%] sm:max-w-sm p-6 sm:p-10 text-center shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
            <div className="relative mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-green-500 text-white p-3 sm:p-6 rounded-full inline-block shadow-lg shadow-green-200">
                <CheckCircle size={28} className="sm:size-40" strokeWidth={3} />
              </div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 sm:mb-3 tracking-tight">Amazing!</h3>
            <p className="text-sm sm:text-base text-slate-500 font-bold mb-6 sm:mb-10 leading-relaxed">
              {isEdit ? 'Your dish has been updated smoothly.' : 'A new delicious dish is now live on your menu!'}
            </p>
            
            <button 
              onClick={() => navigate('/admin/menu')}
              className="group w-full py-4 sm:py-5 bg-[#1d3557] text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 hover:bg-blue-600 transition-all"
            >
              Back to Menu <ChevronRight size={16} className="sm:size-18 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL - Responsive --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
          <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-[90%] sm:max-w-sm p-6 sm:p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-3 sm:p-5 bg-red-50 rounded-2xl sm:rounded-3xl inline-block mb-4 sm:mb-6 text-red-500">
              <LogOut size={32} className="sm:size-48" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Logout?</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8">Ready to leave the kitchen?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={cancelLogout} className="w-full sm:flex-1 py-3 sm:py-4 font-black text-slate-400 uppercase text-[10px] border border-slate-200 rounded-xl sm:rounded-2xl">Wait, no</button>
              <button onClick={confirmLogout} className="w-full sm:flex-1 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEditProduct;