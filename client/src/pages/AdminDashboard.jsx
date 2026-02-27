import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total_sales: 0, total_orders: 0 });

  const fetchAdminData = () => {
    // Kunin ang mga produkto
    fetch('http://localhost/food-api/get_products.php')
      .then(res => res.json())
      .then(data => setProducts(data));

    // Kunin ang summary ng sales mula sa 'orders' table
    fetch('http://localhost/food-api/get_stats.php')
      .then(res => res.json())
      .then(data => setStats(data));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const deleteProduct = (id) => {
    if(window.confirm("Delete this product?")) {
      fetch(`http://localhost/food-api/delete_product.php?id=${id}`, { method: 'DELETE' })
        .then(() => fetchAdminData());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Admin Dashboard</h1>
        <button className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition">+ Add Product</button>
      </div>

      {/* STATS CARDS BASE SA 'orders' TABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-green-500">
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Sales</p>
          <h2 className="text-4xl font-black text-slate-800 mt-2">₱{stats.total_sales}</h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-blue-500">
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Orders Processed</p>
          <h2 className="text-4xl font-black text-slate-800 mt-2">{stats.total_orders}</h2>
        </div>
      </div>

      {/* PRODUCTS TABLE (CRUD) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-6">Product Details</th>
              <th className="p-6 text-center">Category</th>
              <th className="p-6 text-center">Price</th>
              <th className="p-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={product.image_url} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                    <span className="font-bold text-slate-700">{product.name}</span>
                  </div>
                </td>
                <td className="p-6 text-center uppercase text-xs font-black text-slate-400">{product.category}</td>
                <td className="p-6 text-center font-black text-orange-600">₱{product.price}</td>
                <td className="p-6 text-center flex justify-center gap-2">
                  <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition">Edit</button>
                  <button onClick={() => deleteProduct(product.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;