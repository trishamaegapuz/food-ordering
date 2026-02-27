import React, { useState, useEffect } from 'react';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // READ: Kunin ang listahan ng pagkain mula sa database
  useEffect(() => {
    fetch('http://localhost/food-api/get_products.php')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));
  }, []);

  const addToCart = (item) => {
    const exist = cart.find((x) => x.id === item.id);
    if (exist) {
      setCart(cart.map((x) => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const totalAmount = cart.reduce((a, c) => a + c.price * c.qty, 0);

  // CREATE ORDER: I-save ang order sa database
  const handleCheckout = () => {
    const orderData = {
      user_id: 1, // Halimbawa: Static muna, dapat galing sa logged-in user session
      total_amount: totalAmount,
      items: cart
    };

    fetch('http://localhost/food-api/place_order.php', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      alert("Order Placed! Status: " + data.status);
      setCart([]);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row p-4 gap-6">
      <div className="flex-1">
        <h2 className="text-3xl font-black mb-8 text-slate-800">Our Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 group">
              <img 
                src={product.image_url || 'https://via.placeholder.com/150'} 
                alt={product.name}
                className="w-full h-40 object-cover rounded-2xl mb-4 group-hover:scale-105 transition"
              />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{product.category}</span>
              <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-black text-slate-900">₱{product.price}</span>
                <button onClick={() => addToCart(product)} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700 transition">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CART SIDEBAR */}
      <div className="w-full md:w-96 bg-white rounded-[2.5rem] p-8 shadow-2xl h-fit sticky top-6">
        <h3 className="text-2xl font-bold mb-6">Your Cart</h3>
        {cart.map(item => (
          <div key={item.id} className="flex justify-between mb-4 items-center">
            <div className="text-sm font-bold">{item.name} <span className="text-slate-400">x{item.qty}</span></div>
            <span className="font-bold text-orange-600">₱{item.price * item.qty}</span>
          </div>
        ))}
        <div className="border-t pt-4 mt-6 flex justify-between text-2xl font-black">
          <span>Total:</span>
          <span>₱{totalAmount}</span>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 disabled:bg-slate-200 transition"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default Menu;