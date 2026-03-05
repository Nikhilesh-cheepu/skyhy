"use client";

const CALL_NUMBER = "7013884485";

export default function PackagesGrid() {
  const packages = [
    {
      id: 1,
      name: "Package 1 — Starter Treats",
      price: 1600,
      icon: "🥗",
      features: [
        "Mocktails",
        "Soft Drinks",
        "Sodas",
        "Food (Veg + Non-Veg Starters & Mains as per package rules)"
      ]
    },
    {
      id: 2,
      name: "Package 2 — Happy Hour Special",
      price: 2400,
      icon: "🍻",
      features: [
        "Blenders Pride",
        "Smirnoff Vodka",
        "Bacardi Rum / Dark Rum",
        "Mocktails, Soft Drinks & Sodas",
        "Food Included (Starters + Mains + Bread, Salads, Desserts)"
      ]
    },
    {
      id: 3,
      name: "Package 3 — Classic Combo",
      price: 2700,
      icon: "🍽️",
      features: [
        "100 Pipers / Teachers Highland",
        "Smirnoff Vodka",
        "Bacardi Rum / Dark Rum",
        "Kyron Brandy",
        "Beers – KF Premium / Tuborg",
        "Mocktails, Soft Drinks & Sodas",
        "Full Food Menu Included"
      ]
    },
    {
      id: 4,
      name: "Package 4 — Premium Mixer",
      price: 3300,
      icon: "🥂",
      features: [
        "Ballantine's / Teachers 50",
        "Absolut Vodka",
        "Bacardi Rum / Dark Rum",
        "Kyron Brandy",
        "Tickle Gin",
        "Beers – KF Ultra / Budweiser",
        "Breezers, Cocktails & Mocktails",
        "Soft Drinks & Sodas",
        "Full Food Menu Included"
      ]
    },
    {
      id: 5,
      name: "Package 5 — Luxury Lounge",
      price: 3700,
      icon: "👑",
      features: [
        "Chivas Regal 12 yrs / Jameson",
        "Absolut Vodka",
        "Bacardi Rum / Dark Rum",
        "Kyron Brandy",
        "Tickle Gin",
        "Beers – KF Ultra / Budweiser",
        "Breezers, Cocktails & Mocktails",
        "Soft Drinks & Sodas",
        "Full Food Menu Included"
      ]
    },
    {
      id: 6,
      name: "Package 6 — Sky High Royal",
      price: 4000,
      icon: "🌟",
      isPremium: true,
      features: [
        "Top-Shelf Premium Liquor – Black Label, Dewars 15, Jack Daniels, Tanqueray, Premium Wine",
        "Full Unlimited Food Feast – Starters (Veg + Non-Veg), Main Course (Veg + Non-Veg), Rice, Breads, Live Counters, Desserts",
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
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-white/60">
          Choose a party package or call to know more.
        </p>
        <a
          href={`tel:${CALL_NUMBER}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
        >
          Call to know more
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`${
            pkg.isPremium 
              ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-xl border border-[#B6FF00]/80 hover:border-[#B6FF00]" 
              : "bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20"
          } rounded-2xl md:rounded-3xl p-4 md:p-5 h-full flex flex-col relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5`}
        >
          {pkg.isPremium && (
            <div className="absolute -top-3 right-3 rounded-full bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] px-2.5 py-0.5 text-[10px] font-bold text-[#1E40AF] shadow-lg">
              ⭐ PREMIUM PICK
            </div>
          )}

          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${
              pkg.isPremium 
                ? "bg-white/20 backdrop-blur-sm" 
                : "bg-gradient-to-br from-[#2563EB]/20 to-[#3B82F6]/20 border border-[#2563EB]/30"
            }`}>
              <span>{pkg.icon}</span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Party Package
              </div>
              <div className={`text-xl font-extrabold ${
                pkg.isPremium ? "text-[#B6FF00]" : "text-[#2563EB]"
              }`}>
                ₹{pkg.price}{" "}
                <span className="text-[11px] font-semibold text-white/60">
                  per person
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-white/60">
                {pkg.name.replace(/Package \d+ — /, "")}
              </p>
            </div>
          </div>

          <div className="mb-4 space-y-1.5 flex-grow">
            {pkg.features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start text-[11px] ${
                  pkg.isPremium ? "text-white/90" : "text-white/80"
              }`}>
                <span className="mr-2 mt-0.5 flex-shrink-0 text-[13px] text-[#B6FF00]">
                  ✓
                </span>
                <span className="leading-snug">{feature}</span>
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
            className={`mt-auto w-full cursor-pointer rounded-xl px-4 py-2.5 text-[12px] font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
              pkg.isPremium 
                ? "bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] hover:from-[#9AE6B4] hover:to-[#B6FF00]" 
                : "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white hover:from-[#1D4ED8] hover:to-[#2563EB]"
            }`}
            style={{ zIndex: 20 }}
          >
            Book Package
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}