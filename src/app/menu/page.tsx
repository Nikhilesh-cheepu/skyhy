'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Menu data structure
const menuData = {
  food: {
    starters: [
      { id: 1, name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 280, category: 'veg' },
      { id: 2, name: 'Chicken Wings', description: 'Crispy wings with hot sauce', price: 320, category: 'non-veg' },
      { id: 3, name: 'Crispy Corn', description: 'Golden fried corn kernels', price: 180, category: 'veg' },
      { id: 4, name: 'Fish Fry', description: 'Fresh fish with lemon and herbs', price: 350, category: 'non-veg' },
      { id: 5, name: 'Chilli Gobi', description: 'Spicy cauliflower florets', price: 220, category: 'veg' },
    ],
    indian: [
      { id: 6, name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 420, category: 'non-veg' },
      { id: 7, name: 'Dal Makhani', description: 'Rich black lentils with cream', price: 280, category: 'veg' },
      { id: 8, name: 'Biryani', description: 'Fragrant basmati rice with spices', price: 380, category: 'non-veg' },
      { id: 9, name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', price: 320, category: 'veg' },
      { id: 10, name: 'Rogan Josh', description: 'Aromatic lamb curry', price: 450, category: 'non-veg' },
    ],
    chinese: [
      { id: 11, name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 280, category: 'veg' },
      { id: 12, name: 'Chicken Manchurian', description: 'Crispy chicken in tangy sauce', price: 350, category: 'non-veg' },
      { id: 13, name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 180, category: 'veg' },
      { id: 14, name: 'Sweet & Sour Fish', description: 'Fish in tangy sweet sauce', price: 380, category: 'non-veg' },
    ],
    japanese: [
      { id: 15, name: 'California Roll', description: 'Crab, avocado, cucumber', price: 320, category: 'non-veg' },
      { id: 16, name: 'Vegetable Tempura', description: 'Crispy fried vegetables', price: 280, category: 'veg' },
      { id: 17, name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 380, category: 'non-veg' },
    ],
  },
  liquor: {
    whiskey: [
      { id: 18, name: 'Black Label', description: 'Premium Scotch whisky', price: 1200, category: 'premium' },
      { id: 19, name: 'Jack Daniels', description: 'Tennessee whiskey', price: 800, category: 'premium' },
      { id: 20, name: 'Jameson', description: 'Irish whiskey', price: 900, category: 'premium' },
      { id: 21, name: 'Royal Stag', description: 'Indian whiskey', price: 400, category: 'regular' },
    ],
    vodka: [
      { id: 22, name: 'Grey Goose', description: 'Premium French vodka', price: 1000, category: 'premium' },
      { id: 23, name: 'Absolut', description: 'Swedish vodka', price: 600, category: 'premium' },
      { id: 24, name: 'Smirnoff', description: 'Classic vodka', price: 400, category: 'regular' },
    ],
    rum: [
      { id: 25, name: 'Bacardi', description: 'White rum', price: 500, category: 'regular' },
      { id: 26, name: 'Old Monk', description: 'Dark rum', price: 350, category: 'regular' },
    ],
    beer: [
      { id: 27, name: 'Kingfisher', description: 'Indian lager', price: 120, category: 'regular' },
      { id: 28, name: 'Heineken', description: 'Dutch lager', price: 200, category: 'premium' },
      { id: 29, name: 'Corona', description: 'Mexican lager', price: 180, category: 'premium' },
    ],
  },
  happyHour: {
    cocktails: [
      { id: 30, name: 'Mojito', description: 'Mint, lime, soda', price: 250, category: 'cocktail' },
      { id: 31, name: 'Margarita', description: 'Tequila, lime, salt', price: 300, category: 'cocktail' },
      { id: 32, name: 'Cosmopolitan', description: 'Vodka, cranberry, lime', price: 350, category: 'cocktail' },
      { id: 33, name: 'Old Fashioned', description: 'Whiskey, sugar, bitters', price: 400, category: 'cocktail' },
    ],
    mocktails: [
      { id: 34, name: 'Virgin Mojito', description: 'Mint, lime, soda (non-alcoholic)', price: 120, category: 'mocktail' },
      { id: 35, name: 'Pina Colada', description: 'Coconut, pineapple (non-alcoholic)', price: 150, category: 'mocktail' },
      { id: 36, name: 'Blue Lagoon', description: 'Blue curacao, lemon (non-alcoholic)', price: 130, category: 'mocktail' },
    ],
    shots: [
      { id: 37, name: 'Tequila Shot', description: 'Premium tequila', price: 200, category: 'shot' },
      { id: 38, name: 'Vodka Shot', description: 'Premium vodka', price: 180, category: 'shot' },
      { id: 39, name: 'Whiskey Shot', description: 'Premium whiskey', price: 250, category: 'shot' },
    ],
  },
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function MenuPage() {
  const [activeSection, setActiveSection] = useState('food');
  const [activeCategory, setActiveCategory] = useState('starters');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCurrentItems = () => {
    if (activeSection === 'food') {
      return menuData.food[activeCategory as keyof typeof menuData.food] || [];
    } else if (activeSection === 'liquor') {
      return menuData.liquor[activeCategory as keyof typeof menuData.liquor] || [];
    } else {
      return menuData.happyHour[activeCategory as keyof typeof menuData.happyHour] || [];
    }
  };

  const getCategories = () => {
    if (activeSection === 'food') {
      return Object.keys(menuData.food);
    } else if (activeSection === 'liquor') {
      return Object.keys(menuData.liquor);
    } else {
      return Object.keys(menuData.happyHour);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-4 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Image 
                  src="/logo/shyhy-logo-white.png" 
                  alt="SKYHY Live Logo" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                href="/" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Home
              </Link>
              <Link 
                href="/#about" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                About
              </Link>
              <Link 
                href="/#packages" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Packages
              </Link>
              <Link 
                href="/#booking" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Book Table
              </Link>
            </nav>

            {/* Cart Button - Right */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 relative hover:bg-white/25 transition-all duration-300 border border-white/20 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <span className="text-sm font-medium">Cart</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4"
          >
            Our <span className="text-[#2563EB]">Menu</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#64748B] max-w-2xl mx-auto"
          >
            Discover our carefully curated selection of delicious food, premium drinks, and special offers
          </motion.p>
        </div>

        {/* Main Sections */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.keys(menuData).map((section) => (
            <motion.button
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSection(section);
                const categories = section === 'food' ? Object.keys(menuData.food) : 
                                 section === 'liquor' ? Object.keys(menuData.liquor) : 
                                 Object.keys(menuData.happyHour);
                setActiveCategory(categories[0]);
              }}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg ${
                activeSection === section
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[#2563EB]/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl'
              }`}
            >
              {section === 'food' ? '🍽️ Food Menu' : 
               section === 'liquor' ? '🍷 Liquor Menu' : '🎉 Happy Hour Menu'}
            </motion.button>
          ))}
        </div>

        {/* Sub Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {getCategories().map((category) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#2563EB] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {getCurrentItems().map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Item Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#2563EB] transition-colors duration-300">
                  {item.name}
                </h3>
                <span className="text-[#2563EB] font-bold text-lg">₹{item.price}</span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {item.description}
              </p>
              
              {/* Category Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  item.category === 'veg' ? 'bg-green-100 text-green-700' :
                  item.category === 'non-veg' ? 'bg-red-100 text-red-700' :
                  item.category === 'premium' ? 'bg-purple-100 text-purple-700' :
                  item.category === 'regular' ? 'bg-blue-100 text-blue-700' :
                  item.category === 'cocktail' ? 'bg-pink-100 text-pink-700' :
                  item.category === 'mocktail' ? 'bg-cyan-100 text-cyan-700' :
                  item.category === 'shot' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.category === 'veg' ? '🌱 Veg' :
                   item.category === 'non-veg' ? '🍖 Non-Veg' :
                   item.category === 'premium' ? '⭐ Premium' :
                   item.category === 'regular' ? '🍺 Regular' :
                   item.category === 'cocktail' ? '🍸 Cocktail' :
                   item.category === 'mocktail' ? '🥤 Mocktail' :
                   item.category === 'shot' ? '🥃 Shot' :
                   item.category}
                </span>
              </div>
              
              {/* Add to Cart Button */}
              <motion.button
                onClick={() => addToCart(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                Add to Cart
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="bg-white w-96 h-full p-6 overflow-y-auto shadow-2xl"
          >
            {/* Cart Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                <p className="text-sm text-gray-500">{getCartCount()} items</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  🛒
                </div>
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-2">Add some delicious items to get started!</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-gray-600 text-xs">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cart Footer */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-[#2563EB]">₹{getTotal()}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>💳</span>
                    Proceed to Checkout
                  </motion.button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Secure payment • Free delivery
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}