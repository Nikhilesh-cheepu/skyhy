"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export default function MenuPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const menuItems = [
    { id: 1, name: "Paneer Butter Masala", description: "Rich and creamy tomato-based curry", price: 340, image: "🍽️" },
    { id: 2, name: "Ratatouille", description: "Traditional French vegetable stew", price: 420, image: "🍽️" },
    { id: 3, name: "Hyderabadi Biryani", description: "Fragrant basmati rice with spices", price: 380, image: "🍽️" },
    { id: 4, name: "Pasta Alfredo", description: "Creamy fettuccine with parmesan", price: 320, image: "🍽️" },
    { id: 5, name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts", price: 360, image: "🍽️" },
    { id: 6, name: "Coq au Vin", description: "Classic French braised chicken", price: 450, image: "🍽️" },
    { id: 7, name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 280, image: "🍕" },
    { id: 8, name: "Palak Paneer", description: "Cottage cheese in spinach curry", price: 320, image: "🥗" },
    { id: 9, name: "Vegetable Manchurian", description: "Fried vegetable balls in sauce", price: 260, image: "🥗" },
    { id: 10, name: "Dosa with Sambar", description: "South Indian crepe with lentil soup", price: 200, image: "🥗" },
    { id: 11, name: "Vegetable Spring Rolls", description: "Crispy fried spring rolls", price: 240, image: "🥗" },
    { id: 12, name: "Ravioli Ricotta e Spinaci", description: "Italian pasta with cheese filling", price: 380, image: "🍝" },
    { id: 13, name: "Ratatouille Provençal", description: "French mixed vegetable stew", price: 340, image: "🥗" },
    { id: 14, name: "Caprese Salad", description: "Fresh tomatoes and mozzarella", price: 300, image: "🥗" }
  ];

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Main container */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 py-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-[99%] h-[97vh] max-w-8xl mx-auto"
        >
          {/* Main white container */}
          <div className="bg-white rounded-3xl border border-[#E0E7FF] shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden h-full">
            {/* subtle sky gradient overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              background: 'linear-gradient(90deg, #2563EB, #3B82F6)'
            }} />
            
            {/* Fixed Navbar */}
            <div className="fixed top-6 left-6 right-6 z-50">
              <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-2 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo/shyhy-logo-white.png" alt="SKYHY" width={280} height={95} className="h-20 w-auto" />
                  </Link>
                  <nav className="hidden md:flex items-center gap-6 mx-auto">
                    <button 
                      onClick={() => window.location.href = '/#home'} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => window.location.href = '/#about'} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                    >
                      About
                    </button>
                    <button 
                      onClick={() => window.location.href = '/menu'} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                    >
                      Menu
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:bg-white hover:text-[#1E40AF] transition-all duration-300">
                      Connect wallet
                    </button>
                  </nav>
                  
                  {/* Cart Icon */}
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 text-white hover:bg-white hover:text-[#1E40AF] transition-all duration-300"
                  >
                    🛒
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#B6FF00] text-[#1E40AF] text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <div className="relative z-10 p-8 overflow-y-auto h-full pt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-[#1E293B] leading-tight">
                  Menu Full
                </h1>
                <p className="text-lg md:text-xl text-[#475569] mt-4 font-[family-name:var(--font-inter)]">
                  Complete menu with ordering system
                </p>
              </motion.div>

              {/* Menu Items Grid */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-xl p-6 border border-[#E0E7FF] shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                        {item.image}
                      </div>
                      <h3 className="text-xl font-[family-name:var(--font-inter)] font-bold text-[#1E293B] mb-2">
                        {item.name}
                      </h3>
                      <p className="text-[#64748B] text-sm mb-4">
                        {item.description}
                      </p>
                      <div className="text-[#2563EB] font-bold text-lg mb-4">
                        ₹{item.price}
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-[family-name:var(--font-inter)] font-semibold py-2 px-4 rounded-lg hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Cart Sidebar */}
            {showCart && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-[family-name:var(--font-inter)] font-bold text-[#1E293B]">
                      Your Cart
                    </h2>
                    <button
                      onClick={() => setShowCart(false)}
                      className="text-[#64748B] hover:text-[#1E293B] text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-[#64748B] text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg">
                            <div className="text-2xl">{item.image}</div>
                            <div className="flex-1">
                              <h3 className="font-[family-name:var(--font-inter)] font-semibold text-[#1E293B]">
                                {item.name}
                              </h3>
                              <p className="text-[#64748B] text-sm">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 bg-[#E0E7FF] rounded-full flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 bg-[#E0E7FF] rounded-full flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#E0E7FF] pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-[family-name:var(--font-inter)] font-bold text-[#1E293B]">
                            Total:
                          </span>
                          <span className="text-xl font-[family-name:var(--font-inter)] font-bold text-[#2563EB]">
                            ₹{getTotalPrice()}
                          </span>
                        </div>
                        <button className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-[family-name:var(--font-inter)] font-semibold py-3 px-4 rounded-lg hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all duration-300">
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
