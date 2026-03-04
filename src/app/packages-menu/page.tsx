'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Footer from '@/components/Footer';
import PackagesGrid from '@/components/PackagesGrid';
import PageTopBar from '@/components/PageTopBar';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'packages' | 'menu'>(
    tabParam === 'menu' ? 'menu' : 'packages'
  );
  const [menuData, setMenuData] = useState<MenuDataFromApi | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');

  // Menu-specific state (only used when menu tab is active)
  const [activeSection, setActiveSection] = useState('food');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<{ discount: number; finalAmountRupees: number; holdExpiresAt: string } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
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

  const cartKey = JSON.stringify(cart.map((c) => `${c.id}:${c.quantity}`));
  useEffect(() => {
    setOrderId(null);
    setClaimInfo(null);
    setClaimError('');
    setCountdown(null);
  }, [cartKey]);

  useEffect(() => {
    if (!claimInfo || !orderId) return;
    const expires = new Date(claimInfo.holdExpiresAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        fetch('/api/coupons/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        }).finally(() => {
          setOrderId(null);
          setClaimInfo(null);
          setCountdown(null);
          setClaimError('Coupon expired. You can try again.');
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [claimInfo, orderId]);

  const hasNon128Items = cart.some((item) => item.price !== 128);

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

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // 10% service + 2% platform + 5% GST = 17%
  const TAXES_RATE = 0.17;

  const subtotal = getSubtotal();
  const taxesAndCharges = Math.round(subtotal * TAXES_RATE);
  const baseTotal = subtotal + taxesAndCharges;
  const discountAmount = claimInfo?.discount ?? 0;
  const finalTotal = claimInfo ? claimInfo.finalAmountRupees : Math.max(0, baseTotal);




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

  const ensureLoggedIn = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.status === 401) {
        router.push('/login?returnTo=/packages-menu');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Offer ticker messages
  const OFFER_MESSAGES = [
    "Eat & Drink Anything @ ₹128 • 12:00 PM – 7:45 PM",
    "25% OFF on À la carte Menu",
    "Book a table to reserve your offer",
  ];

  const [offerIndex, setOfferIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setOfferIndex((i) => (i + 1) % OFFER_MESSAGES.length),
      3000,
    );
    return () => clearInterval(id);
  }, [OFFER_MESSAGES.length]);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Padding for global header */}
      <div className="pb-4 pt-6 md:pt-8">
        <div className="mx-auto max-w-6xl px-4">
          {/* Sticky header area inside page */}
          <div className="sticky top-16 z-20 bg-black/95 pb-3 backdrop-blur">
            <PageTopBar title="Party Packages & Menu" />

            {/* Offer highlight pill */}
            <div className="mt-1 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80 shadow-[0_0_20px_rgba(37,99,235,0.35)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="truncate">{OFFER_MESSAGES[offerIndex]}</span>
              </div>
            </div>

            {/* Segmented toggle */}
            <div className="mt-3 flex rounded-full bg-white/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("packages")}
              className={`flex-1 rounded-full py-1.5 ${
                activeTab === "packages"
                  ? "bg-white text-black font-semibold"
                  : "text-white/70"
              }`}
            >
              Party Packages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`flex-1 rounded-full py-1.5 ${
                activeTab === "menu"
                  ? "bg-white text-black font-semibold"
                  : "text-white/70"
              }`}
            >
              Menu
            </button>
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "packages" ? (
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
              {menuLoading && (
                <p className="py-12 text-center text-white/70">
                  Loading menu…
                </p>
              )}
              {menuError && (
                <p className="py-12 text-center text-red-400">{menuError}</p>
              )}
              {!menuLoading && !menuError && menuData && (
                <>
                  {/* Main Sections - compact chips */}
                  <div className="mt-2 overflow-x-auto no-scrollbar">
                    <div className="flex gap-1.5 text-[11px]">
                      {Object.keys(menuData).map((section) => (
                        <button
                          key={section}
                          onClick={() => handleSectionChange(section)}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-medium ${
                            activeSection === section
                              ? "bg-[#2563EB] border-[#2563EB] text-white"
                              : "bg-white/5 border-white/20 text-white/70"
                          }`}
                        >
                          {section === "food"
                            ? "🍽️ Food"
                            : section === "beverage"
                            ? "🥤 Beverage"
                            : section === "liquor"
                            ? "🍷 Liquor"
                            : section === "store"
                            ? "🏪 Store"
                            : section === "special-128"
                            ? "🎉 Eat & Drink @ ₹128"
                            : section}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search + categories row */}
                  <div className="relative mx-auto mb-3 max-w-2xl">
                    <div className="flex gap-2 text-[12px]">
                      <div className="relative flex-[0.7]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchSuggestions(
                              e.target.value.length > 0,
                            );
                          }}
                          onFocus={() =>
                            setShowSearchSuggestions(searchQuery.length > 0)
                          }
                          onBlur={() =>
                            setTimeout(
                              () => setShowSearchSuggestions(false),
                              200,
                            )
                          }
                          placeholder="Search menu..."
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 pl-7 text-[12px] text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/50">
                          🔍
                        </span>

                        {/* Search Suggestions */}
                        {showSearchSuggestions &&
                          searchSuggestions.length > 0 && (
                            <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-black/95 shadow-2xl backdrop-blur-xl">
                              <div className="max-height-64 overflow-y-auto">
                                {searchSuggestions.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSearchQuery(item.name);
                                      setShowSearchSuggestions(false);
                                    }}
                                    className="w-full cursor-pointer px-4 py-2.5 text-left text-[12px] transition-all duration-150 hover:bg-white/10 active:bg-white/20"
                                  >
                                    <p className="text-sm font-medium text-white">
                                      {item.name}
                                    </p>
                                    <p className="mt-1 text-xs text-white/60">
                                      {item.description}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Categories dropdown trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                        }
                        className="flex flex-[0.3] items-center justify-between rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-[11px] text-white/80"
                      >
                        <span>
                          {selectedCategories.length
                            ? `${selectedCategories.length} filters`
                            : "All categories"}
                        </span>
                        <span>▾</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Filters dropdown */}
                  <div className="relative mb-4">
                    <div className="mx-auto max-w-4xl">
                      {isCategoryDropdownOpen && (
                        <>
                          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-black/95 shadow-2xl backdrop-blur-xl">
                            <div className="max-h-96 overflow-y-auto p-4">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => {
                                  const isSelected =
                                    selectedCategories.includes(category);
                                  return (
                                    <label
                                      key={category}
                                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150 ${
                                        isSelected
                                          ? "bg-gradient-to-r from-[#2563EB]/30 to-[#3B82F6]/30 border border-[#2563EB]"
                                          : "bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          if (e.target.checked) {
                                            setSelectedCategories([
                                              ...selectedCategories,
                                              category,
                                            ]);
                                          } else {
                                            setSelectedCategories(
                                              selectedCategories.filter(
                                                (c) => c !== category,
                                              ),
                                            );
                                          }
                                        }}
                                        className="h-5 w-5 rounded border-white/30 bg-white/10 text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                                      />
                                      <span className="flex-1 text-sm font-medium text-white">
                                        {formatCategoryName(category)}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              {selectedCategories.length > 0 && (
                                <div className="mt-4 border-t border-white/20 pt-4">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedCategories([]);
                                    }}
                                    className="w-full cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/20 active:bg-white/30"
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

                  {/* Menu Items - compact cards */}
                  <div className="mt-4 mb-20 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {currentItems.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-1 rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-white/80"
                      >
                        {/* Top row: name + price */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-[13px] font-semibold text-white">
                            {item.name}
                          </h3>
                          <span className="text-[13px] font-semibold text-[#FACC15]">
                            ₹{item.price}
                          </span>
                        </div>

                        {/* One-line description */}
                        <p className="text-[11px] text-white/60 line-clamp-1">
                          {item.description}
                        </p>

                        {/* Veg / Non-veg badge */}
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              item.category === "veg"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : item.category === "non-veg"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-white/10 text-white/70 border border-white/20"
                            }`}
                          >
                            {item.category === "veg"
                              ? "🌱 Veg"
                              : item.category === "non-veg"
                              ? "🍖 Non-Veg"
                              : item.category}
                          </span>
                        </div>

                        {/* Add to cart / quantity controls */}
                        {getItemQuantity(item.id) > 0 ? (
                          <div className="flex items-center justify-end gap-1 pt-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateQuantity(
                                  item.id,
                                  getItemQuantity(item.id) - 1,
                                );
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                              -
                            </button>
                            <div className="min-w-[40px] rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-1 text-center text-[11px] font-bold text-white">
                              {getItemQuantity(item.id)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
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
                            className="mt-1 w-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] py-1.5 text-[11px] font-semibold text-white hover:from-[#1D4ED8] hover:to-[#2563EB]"
                          >
                            <span>🛒</span>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

      {/* Cart summary bar */}
      {activeTab === 'menu' && getCartCount() > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-2 text-[12px] text-white"
          >
            <span>
              {getCartCount()} items • ₹{finalTotal}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">
              View Cart
            </span>
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

                <div className="border-t border-white/20 pt-6 space-y-3">
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Taxes & Charges</span>
                    <span>₹{taxesAndCharges}</span>
                  </div>
                  {claimInfo ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm text-emerald-400">
                        <span>25% off À la carte applied</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                      {countdown !== null && countdown > 0 && (
                        <p className="text-xs text-white/60">
                          Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  ) : hasNon128Items ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80">25% off À la carte</span>
                        <button
                          type="button"
                          disabled={claiming}
                          onClick={async () => {
                            setClaiming(true);
                            setClaimError('');
                            try {
                              const draftRes = await fetch('/api/orders/create-draft', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity, price: i.price })),
                                }),
                              });
                              const draft = await draftRes.json();
                              if (!draftRes.ok || !draft.orderId) {
                                setClaimError(draft.error || 'Could not create order');
                                return;
                              }
                              const claimRes = await fetch('/api/coupons/claim', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: draft.orderId }),
                              });
                              const claim = await claimRes.json();
                              if (!claimRes.ok || !claim.success) {
                                setClaimError(
                                  claim.message ||
                                    (claim.error === 'already_used_today'
                                      ? 'Coupon already applied for you for this day. Please try again after 24 hours.'
                                      : claim.error === 'quota_full'
                                      ? 'No coupons left for today. Please try again tomorrow.'
                                      : 'Could not apply coupon. Please try again.')
                                );
                                return;
                              }
                              setOrderId(draft.orderId);
                              setClaimInfo({
                                discount: claim.discount,
                                finalAmountRupees: claim.finalAmountRupees,
                                holdExpiresAt: claim.holdExpiresAt,
                              });
                            } catch {
                              setClaimError('Failed to apply coupon');
                            } finally {
                              setClaiming(false);
                            }
                          }}
                          className="text-sm font-medium text-amber-300 hover:text-amber-200 underline cursor-pointer disabled:opacity-60"
                        >
                          {claiming ? 'Applying…' : 'Apply'}
                        </button>
                      </div>
                      {claimError && <p className="text-xs text-red-400">{claimError}</p>}
                    </div>
                  ) : null}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-amber-300">₹{finalTotal}</span>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const ok = await ensureLoggedIn();
                      if (!ok) return;
                      const total = finalTotal;
                      if (total <= 0) {
                        const orderItems = cart
                          .map(
                            (item) =>
                              `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`,
                          )
                          .join('%0A');
                        const message = `*Order from SKYHY Live*%0A%0A${orderItems}%0A%0A*Total: ₹${total}*%0A%0APlease confirm this order. Thank you!`;
                        window.open(`https://wa.me/7013884485?text=${message}`, '_blank');
                        return;
                      }

                      try {
                        const orderRes = await fetch('/api/razorpay/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(
                            orderId
                              ? {
                                  type: 'cart',
                                  orderId,
                                  currency: 'INR',
                                }
                              : {
                                  type: 'cart',
                                  amount: Math.round(total * 100),
                                  currency: 'INR',
                                  items: cart.map((item) => ({
                                    menuItemId: item.id,
                                    quantity: item.quantity,
                                    price: item.price,
                                  })),
                                }
                          ),
                        });
                        const orderData = await orderRes.json();
                        if (!orderRes.ok || orderData?.error || !orderData?.id) {
                          throw new Error(orderData.error || 'Failed to create payment order');
                        }
                        const amountPaise = orderData.amount ?? Math.round(total * 100);
                        const totalPaid = orderData.finalAmountRupees ?? amountPaise / 100;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const RazorpayConstructor = (window as any).Razorpay;
                        if (!RazorpayConstructor) {
                          throw new Error('Payment SDK not loaded. Please try again.');
                        }

                        const options = {
                          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                          amount: amountPaise,
                          currency: 'INR',
                          name: 'SKYHY Live',
                          description: 'Food & beverages order',
                          order_id: orderData.id,
                          theme: { color: '#eab308' },
                          handler: (response: { razorpay_payment_id?: string } | undefined) => {
                            const params = new URLSearchParams({
                              status: 'paid',
                              total: String(totalPaid),
                              paymentId: response?.razorpay_payment_id || '',
                            });
                            setCart([]);
                            setOrderId(null);
                            setClaimInfo(null);
                            setShowCart(false);
                            window.location.href = `/orders/success?${params.toString()}`;
                          },
                        };

                        const rzp = new RazorpayConstructor(options);
                        rzp.open();
                      } catch (err) {
                        alert(
                          err instanceof Error
                            ? err.message
                            : 'Failed to start payment. Please try again.',
                        );
                      }
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>💳</span>
                    Pay & Confirm Order
                  </button>
                  <p className="text-center text-xs text-white/60 mt-3">
                    Payment via Razorpay. We’ll also receive your order on WhatsApp.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

        {/* Footer Section */}
        <Footer />
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
    </div>
  );
}

export default function PackagesMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <PackagesMenuPageContent />
    </Suspense>
  );
}
