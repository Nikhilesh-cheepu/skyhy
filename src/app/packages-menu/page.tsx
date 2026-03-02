'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import PackagesGrid from '@/components/PackagesGrid';
import StickyActions from '@/components/StickyActions';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

type MenuDataFromApi = Record<string, Record<string, MenuItem[]>>;

function PackagesMenuPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'packages' | 'menu'>(
    tabParam === 'menu' ? 'menu' : 'packages'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState<MenuDataFromApi | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');

  // Menu-specific state (only used when menu tab is active)
  const [activeSection, setActiveSection] = useState('food');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setMenuError(data.error);
        else setMenuData(data);
      })
      .catch(() => setMenuError('Failed to load menu'))
      .finally(() => setMenuLoading(false));
  }, []);

  useEffect(() => {
    if (tabParam === 'menu') {
      setActiveTab('menu');
    }
  }, [tabParam]);

  // Menu functions - optimized with useCallback
  const addToCart = useCallback((item: MenuItem) => {
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
  }, []);

  const getItemQuantity = useCallback((itemId: number): number => {
    return cart.find(item => item.id === itemId)?.quantity || 0;
  }, [cart]);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== id);
      } else {
        return prevCart.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
      }
    });
  }, []);

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };




  const formatCategoryName = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Memoize expensive operations
  const sectionData = menuData?.[activeSection];
  const currentItems = useMemo(() => {
    if (!sectionData) return [];
    let allItems: MenuItem[] = [];
    Object.values(sectionData).forEach(category => {
      allItems = [...allItems, ...category];
    });
    
    let filteredItems = allItems;
    if (selectedCategories.length > 0 && sectionData) {
      filteredItems = selectedCategories.flatMap(cat => sectionData[cat] || []);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return filteredItems;
  }, [selectedCategories, searchQuery, sectionData]);

  const categories = useMemo(() => {
    return sectionData ? Object.keys(sectionData) : [];
  }, [sectionData]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !sectionData) return [];
    const query = searchQuery.toLowerCase();
    const allItems: MenuItem[] = Object.values(sectionData).flat();
    
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, sectionData]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    setSelectedCategories([]);
    setSearchQuery('');
    setIsCategoryDropdownOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Navigation Header - Same as Home Page */}
      <div className="fixed top-0 left-0 right-0 z-50 md:top-4 md:left-4 md:right-4">
        <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-none md:rounded-xl shadow-lg px-4 md:px-2 max-w-6xl mx-auto md:mx-auto h-16 md:h-20 flex items-center">
          <div className="flex items-center justify-between w-full relative">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo/shyhy-logo-white.png" alt="SKYHY" width={200} height={68} className="h-10 md:h-14 w-auto" />
            </Link>
            
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                href="/"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                Home
              </Link>
              <Link 
                href="/#about"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                About
              </Link>
              <Link 
                href="/packages-menu"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                Packages & Menu
              </Link>
              <Link 
                href="/reserve"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                Reserve
              </Link>
            </nav>

            {/* Mobile Hamburger Menu */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-40 md:hidden md:top-20 md:left-4 md:right-4"
        >
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-4 max-w-6xl mx-auto">
            <nav className="flex flex-col items-center space-y-4">
              <Link 
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Home
              </Link>
              <Link 
                href="/#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                About
              </Link>
              <Link 
                href="/packages-menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Packages & Menu
              </Link>
              <Link 
                href="/reserve"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Reserve
              </Link>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Add top padding to account for fixed navbar */}
      <div className="pt-20 md:pt-24">

        <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Party <span className="text-[#2563EB]">Packages</span> & <span className="text-[#B6FF00]">Menu</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
          >
            Explore our party packages and complete menu in one place
          </motion.p>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('packages');
              }}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 active:bg-white/30 border border-white/20'
              }`}
            >
              📦 Party Packages
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('menu');
              }}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 active:bg-white/30 border border-white/20'
              }`}
            >
              🍽️ View Menu
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'packages' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="packages"
          >
            <PackagesGrid />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="menu"
            className="w-full"
          >
            {/* Happy Hours & Timings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6 mb-8"
            >
              <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-widest text-white/70 mb-3 font-medium">
                    12PM - 8PM
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-white uppercase leading-tight">
                    EAT &amp; DRINK ANYTHING @128
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.a
                  href="https://maps.app.goo.gl/8izvX92jtyZyJnUV9?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 cursor-pointer"
                >
                  <span>📍</span>
                  Locate Us
                </motion.a>
                
                <Link href="/reserve">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  >
                    <span>📅</span>
                    Book Table Now
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {menuLoading && (
              <p className="text-white/70 text-center py-12">Loading menu…</p>
            )}
            {menuError && (
              <p className="text-red-400 text-center py-12">{menuError}</p>
            )}
            {!menuLoading && !menuError && menuData && (
            <div>
            {/* Main Sections */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {Object.keys(menuData).map((section) => (
                <button
                  key={section}
                  onClick={() => handleSectionChange(section)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg cursor-pointer ${
                    activeSection === section
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[#2563EB]/25'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
                  }`}
                >
                  {section === 'food' ? '🍽️ Food' : 
                   section === 'beverage' ? '🥤 Beverage' :
                   section === 'liquor' ? '🍷 Liquor' : 
                   section === 'store' ? '🏪 Store' :
                   section === 'special-128' ? '🎉 Eat & Drink @ ₹128' : section}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  placeholder="Search menu items..."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 pl-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-300"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg">🔍</span>
                
                {/* Search Suggestions */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {searchSuggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSearchQuery(item.name);
                            setShowSearchSuggestions(false);
                          }}
                          className="w-full px-6 py-3 text-left hover:bg-white/10 active:bg-white/20 transition-all duration-150 cursor-pointer"
                        >
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-white/60 text-xs mt-1">{item.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-8 relative">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 flex items-center justify-between text-white hover:bg-white/20 active:bg-white/30 transition-all duration-200 shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔽</span>
                    <span className="font-semibold text-sm md:text-base">
                      {selectedCategories.length > 0 
                        ? `${selectedCategories.length} Filter${selectedCategories.length > 1 ? 's' : ''} Selected`
                        : 'All Categories'}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-white/80 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoryDropdownOpen && (
                  <>
                    <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="max-h-96 overflow-y-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categories.map((category) => {
                            const isSelected = selectedCategories.includes(category);
                            return (
                              <label
                                key={category}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#2563EB]/30 to-[#3B82F6]/30 border border-[#2563EB]'
                                    : 'bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (e.target.checked) {
                                      setSelectedCategories([...selectedCategories, category]);
                                    } else {
                                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-white/30 bg-white/10 text-[#2563EB] focus:ring-[#2563EB] focus:ring-2"
                                />
                                <span className="text-white font-medium text-sm flex-1">
                                  {formatCategoryName(category)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        {selectedCategories.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedCategories([]);
                              }}
                              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                            >
                              Clear All Filters
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-200 border border-white/10 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-base group-hover:text-[#2563EB] transition-colors duration-200">
                      {item.name}
                    </h3>
                    <span className="text-[#2563EB] font-bold text-lg">₹{item.price}</span>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'veg' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      item.category === 'non-veg' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {item.category === 'veg' ? '🌱 Veg' :
                       item.category === 'non-veg' ? '🍖 Non-Veg' :
                       item.category}
                    </span>
                  </div>
                  
                  {getItemQuantity(item.id) > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuantity(item.id, getItemQuantity(item.id) - 1);
                        }}
                        className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white py-3 px-4 rounded-xl text-lg font-semibold transition-all duration-200 border border-white/20 cursor-pointer"
                      >
                        -
                      </button>
                      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-3 px-6 rounded-xl text-sm font-bold min-w-[60px] text-center">
                        {getItemQuantity(item.id)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white py-3 px-4 rounded-xl text-lg font-semibold transition-all duration-200 border border-white/20 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] active:from-[#1E40AF] active:to-[#1D4ED8] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>🛒</span>
                      Add to Cart
                    </button>
                  )}
                </div>
              ))}
            </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
          <Link href="/reserve">
            <button
              className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/20 flex items-center gap-2 hover:from-[#A5E600] hover:to-[#8AD9A0] active:from-[#95D600] active:to-[#7ACC8C] cursor-pointer"
            >
              <span>📅</span>
              Book Reservation
            </button>
          </Link>
          <Link href="/">
            <button
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <span>🏠</span>
              Go Home
            </button>
          </Link>
        </div>
            </div>
            )}
          </motion.div>
        )}

      {/* Floating Cart Button at Bottom - above StickyActions */}
      {activeTab === 'menu' && getCartCount() > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40 md:left-auto md:right-8 md:bottom-8 md:w-auto md:max-w-md">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowCart(true);
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between hover:from-[#1D4ED8] hover:to-[#2563EB] active:from-[#1E40AF] active:to-[#1D4ED8] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div className="text-left">
                <p className="text-sm md:text-base font-medium">View Cart</p>
                <p className="text-xs md:text-sm opacity-80">{getCartCount()} items • ₹{getTotal()}</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2 ml-4">
              <span className="text-lg md:text-xl font-bold">₹{getTotal()}</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && activeTab === 'menu' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end md:justify-end">
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="bg-black/90 backdrop-blur-xl border-l border-white/20 w-full md:w-96 h-full p-6 overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Cart</h2>
                <p className="text-sm text-white/70">{getCartCount()} items</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCart(false);
                }}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 active:bg-white/30 transition-colors duration-150 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  🛒
                </div>
                <p className="text-white/80 text-lg">Your cart is empty</p>
                <p className="text-white/60 text-sm mt-2">Add some delicious items to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-150"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                        <p className="text-white/70 text-xs">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 active:bg-white/30 transition-colors duration-150 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 active:bg-white/30 transition-colors duration-150 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-white">Total:</span>
                    <span className="text-2xl font-bold text-[#2563EB]">₹{getTotal()}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const orderItems = cart.map(item => 
                        `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
                      ).join('%0A');
                      const message = `*Order from SKYHY Live*%0A%0A${orderItems}%0A%0A*Total: ₹${getTotal()}*%0A%0APlease confirm this order. Thank you!`;
                      window.open(`https://wa.me/7013884485?text=${message}`, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-[#1D4ED8] hover:to-[#2563EB] active:from-[#1E40AF] active:to-[#1D4ED8] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📱</span>
                    Send Order via WhatsApp
                  </button>
                  <p className="text-center text-xs text-white/60 mt-3">
                    Or show this to our waiter
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

        {/* Footer Section */}
        <Footer />

        <StickyActions />
      </div>
    </div>
    </div>
  );
}

export default function PackagesMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <PackagesMenuPageContent />
    </Suspense>
  );
}
