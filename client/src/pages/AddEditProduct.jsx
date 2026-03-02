import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://food-ordering-wq61.onrender.com';

const AddEditProduct = () => {
  const { id } = useParams(); // Kung may ID, Edit mode tayo
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Appetizers',
    image_url: ''
  });

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      const product = res.data.find(p => p.id === parseInt(id));
      if (product) setFormData(product);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (id) {
        await axios.put(`${API_URL}/api/products/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/admin/menu');
    } catch (err) {
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-8 flex justify-center items-center">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
          <button onClick={() => navigate('/admin/menu')} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-black text-slate-800">{id ? 'Edit' : 'Add New'} Product</h2>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Product Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Price (₱)</label>
                <input 
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Category</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Appetizers</option>
                  <option>Main Courses</option>
                  <option>Desserts</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Image URL</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Description</label>
            <textarea 
              rows="4"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#1d3557] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {id ? 'Update' : 'Create'} Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;