"use client";

export default function PackagesGrid() {
  const packages = [
    {
      id: 1,
      name: "Starter Treats",
      price: 999,
      icon: "🥗",
      features: [
        "Unlimited Veg Starters (Paneer Tikka, Crispy Corn, Chilli Gobi)",
        "Unlimited Non-Veg Starters (Chicken Wings, Fish Fry)",
        "2 Mocktails / Soft Drinks",
        "1 Dessert"
      ]
    },
    {
      id: 2,
      name: "Happy Hour Special",
      price: 1499,
      icon: "🍻",
      features: [
        "Unlimited Starters (3 Veg + 3 Non-Veg)",
        "Unlimited Main Course (Veg Biryani, Chicken Curry, Dal, Roti)",
        "3 Cocktails or Beers",
        "1 Dessert"
      ]
    },
    {
      id: 3,
      name: "Classic Combo",
      price: 1799,
      icon: "🍽️",
      features: [
        "Unlimited Starters (4 Veg + 4 Non-Veg)",
        "Unlimited Main Course (Veg + Non-Veg + Rice + Roti)",
        "Unlimited Indian Liquor (Whisky, Rum, Vodka)",
        "Ice Cream & Gulab Jamun"
      ]
    },
    {
      id: 4,
      name: "Premium Mixer",
      price: 2299,
      icon: "🥂",
      features: [
        "Unlimited Starters (5 Veg + 5 Non-Veg)",
        "Unlimited Main Course Buffet",
        "Unlimited Imported Drinks (Ballantine's, Absolut, Bacardi)",
        "Desserts + Mocktails"
      ]
    },
    {
      id: 5,
      name: "Luxury Lounge",
      price: 2799,
      icon: "👑",
      features: [
        "Unlimited Food (Starters + Main Course + Salads + Desserts)",
        "Unlimited Premium Imported Drinks (Jack Daniels, Jameson, Grey Goose)",
        "1 Signature Cocktail Special",
        "Ice Cream Sundae"
      ]
    },
    {
      id: 6,
      name: "Sky High Royal",
      price: 3499,
      icon: "🌟",
      isPremium: true,
      features: [
        "Unlimited Food Feast (Starters, Main Course, Live Counters, Desserts)",
        "Unlimited Top-Shelf Liquor (Black Label, Dewars 15, Tanqueray, Wine)",
        "2 Premium Cocktails of Choice",
        "Chef's Special Dessert Platter"
      ]
    }
  ];

interface PackageData {
  id: number;
  name: string;
  price: number;
  icon: string;
  features: string[];
  isPremium?: boolean;
}

  const handleBookPackage = (pkg: PackageData) => {
    console.log('Booking package:', pkg.name);
    const featuresList = pkg.features.map((feature: string) => `• ${feature}`).join('\n');
    const message = `*PARTY PACKAGE BOOKING REQUEST*\n\n*Restaurant:* SKYHY Live\n*Package:* ${pkg.name}\n*Price:* ₹${pkg.price} per person\n\n*Package Includes:*\n${featuresList}\n\n*Requested Time:* ${new Date().toLocaleString()}\n\nPlease confirm availability and contact me back with booking details. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/7013884485?text=${encodedMessage}`;
    console.log('Opening WhatsApp:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`${
            pkg.isPremium 
              ? "bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] shadow-2xl border-2 border-[#B6FF00]" 
              : "bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] shadow-lg border border-[#E0E7FF]"
          } rounded-2xl md:rounded-3xl p-4 md:p-8 h-full flex flex-col relative`}
        >
          {pkg.isPremium && (
            <div className="absolute top-2 right-2 bg-[#B6FF00] text-[#1E40AF] px-2 py-1 rounded-full text-xs font-bold z-10">
              ✨ PREMIUM
            </div>
          )}
          
          <div className="text-center mb-4 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl text-white">{pkg.icon}</span>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${
              pkg.isPremium ? 'text-white' : 'text-[#1E293B]'
            }`}>
              {pkg.name}
            </h3>
            <div className={`text-2xl font-black mb-2 ${
              pkg.isPremium ? 'text-[#B6FF00]' : 'text-[#2563EB]'
            }`}>
              ₹{pkg.price}
            </div>
            <p className={`text-xs ${
              pkg.isPremium ? 'text-white/80' : 'text-[#64748B]'
            }`}>
              per person
            </p>
          </div>
          
          <div className="space-y-2 mb-4 flex-grow">
            {pkg.features.map((feature, index) => (
              <div key={index} className={`flex items-start text-xs ${
                pkg.isPremium ? 'text-white/90' : 'text-[#64748B]'
              }`}>
                <span className="mr-2 text-green-500">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookPackage(pkg);
            }}
            className="w-full bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 text-sm cursor-pointer hover:scale-105 mt-auto"
            style={{ zIndex: 20 }}
          >
            Book Package
          </button>
        </div>
      ))}
    </div>
  );
}