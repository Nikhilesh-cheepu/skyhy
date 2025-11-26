'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import PackagesGrid from '@/components/PackagesGrid';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Full menu data structure
const menuData = {
  food: {
    salad: [
      { id: 1, name: 'Greek Salad', description: 'Fresh vegetables with feta cheese and olives', price: 379, category: 'veg' },
      { id: 2, name: 'Green Salad', description: 'Fresh mixed greens with dressing', price: 379, category: 'veg' },
      { id: 3, name: 'Caesar Salad Veg', description: 'Crisp romaine lettuce with Caesar dressing', price: 379, category: 'veg' },
      { id: 4, name: 'Greek Salad Chicken', description: 'Greek salad topped with grilled chicken', price: 489, category: 'non-veg' },
      { id: 5, name: 'Caesar Salad Chicken', description: 'Caesar salad with grilled chicken', price: 489, category: 'non-veg' },
      { id: 6, name: 'Onion Salad', description: 'Fresh onion salad with spices', price: 49, category: 'veg' },
      { id: 7, name: 'Watermelon Salad', description: 'Refreshing watermelon with mint and feta', price: 199, category: 'veg' },
    ],
    'veg-starters': [
      { id: 8, name: 'Crispy Corn', description: 'Golden fried corn kernels with spices', price: 359, category: 'veg' },
      { id: 9, name: 'Mexican Nachos Veg', description: 'Crispy nachos with vegetables and cheese', price: 379, category: 'veg' },
      { id: 10, name: 'Veg Manchurian', description: 'Crispy vegetable balls in tangy sauce', price: 429, category: 'veg' },
      { id: 11, name: 'Paneer Popcorn', description: 'Bite-sized crispy paneer pieces', price: 429, category: 'veg' },
      { id: 12, name: 'Chilli Paneer', description: 'Paneer cubes in spicy chilli sauce', price: 429, category: 'veg' },
      { id: 13, name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 429, category: 'veg' },
      { id: 14, name: 'Chutney Paneer Tikka', description: 'Paneer tikka with mint chutney', price: 429, category: 'veg' },
      { id: 15, name: 'Tandoori Malai Broccoli', description: 'Creamy tandoori broccoli', price: 429, category: 'veg' },
      { id: 16, name: 'French Fries', description: 'Crispy golden french fries', price: 329, category: 'veg' },
    ],
    'non-veg-starters': [
      { id: 17, name: 'Chicken 65', description: 'Spicy deep-fried chicken pieces', price: 429, category: 'non-veg' },
      { id: 18, name: 'Pepper Chicken', description: 'Chicken cooked in black pepper sauce', price: 429, category: 'non-veg' },
      { id: 19, name: 'Hong Kong Chilli Chicken', description: 'Crispy chicken in Hong Kong style chilli sauce', price: 429, category: 'non-veg' },
      { id: 20, name: 'Chicken Drumsticks', description: 'Tender chicken drumsticks with spices', price: 429, category: 'non-veg' },
      { id: 21, name: 'Kodi Vepudu', description: 'Andhra style spicy chicken fry', price: 429, category: 'non-veg' },
      { id: 22, name: 'Mexican Nachos Chicken', description: 'Crispy nachos with chicken and cheese', price: 429, category: 'non-veg' },
      { id: 23, name: 'Crispy Fried Chicken', description: 'Golden crispy fried chicken pieces', price: 429, category: 'non-veg' },
      { id: 24, name: 'Crispy Fried Wings', description: 'Crispy chicken wings with spices', price: 429, category: 'non-veg' },
      { id: 25, name: 'Classic Chicken Tikka', description: 'Tandoori grilled chicken tikka', price: 429, category: 'non-veg' },
      { id: 26, name: 'Murg Malai Kebab', description: 'Creamy marinated chicken kebab', price: 429, category: 'non-veg' },
      { id: 27, name: 'Murg Banjara Kebab', description: 'Spicy banjara style chicken kebab', price: 429, category: 'non-veg' },
      { id: 28, name: 'Chicken Ghee Roast', description: 'Chicken roasted in ghee with spices', price: 489, category: 'non-veg' },
      { id: 29, name: 'Thai Chilli Fish', description: 'Fish in Thai style chilli sauce', price: 549, category: 'non-veg' },
      { id: 30, name: 'Apollo Fish', description: 'Crispy fish in tangy sauce', price: 549, category: 'non-veg' },
      { id: 31, name: 'Chilli Fish', description: 'Fish in spicy chilli sauce', price: 549, category: 'non-veg' },
      { id: 32, name: 'Lasouni Fish Tikka', description: 'Garlic marinated fish tikka', price: 549, category: 'non-veg' },
      { id: 33, name: 'Prawns Salt & Pepper', description: 'Crispy prawns with salt and pepper', price: 549, category: 'non-veg' },
      { id: 34, name: 'Butter Garlic Prawns', description: 'Prawns in butter garlic sauce', price: 549, category: 'non-veg' },
    ],
    burger: [
      { id: 35, name: 'Veg Cheese Burger', description: 'Vegetable patty with cheese and veggies', price: 329, category: 'veg' },
      { id: 36, name: 'Chicken Cheese Burger', description: 'Chicken patty with cheese and veggies', price: 379, category: 'non-veg' },
    ],
    sandwich: [
      { id: 37, name: 'Veg Club Sandwich', description: 'Triple decker sandwich with vegetables', price: 247, category: 'veg' },
      { id: 38, name: 'Paneer Tikka Sandwich', description: 'Grilled paneer tikka in sandwich', price: 329, category: 'veg' },
      { id: 39, name: 'Chicken Club Sandwich', description: 'Triple decker sandwich with chicken', price: 379, category: 'non-veg' },
      { id: 40, name: 'Chicken Tikka Sandwich', description: 'Grilled chicken tikka in sandwich', price: 379, category: 'non-veg' },
    ],
    sides: [
      { id: 41, name: 'Masala Peanut', description: 'Spiced roasted peanuts', price: 329, category: 'veg' },
      { id: 42, name: 'French Fries / Peri Peri', description: 'Crispy fries with peri peri seasoning', price: 329, category: 'veg' },
      { id: 43, name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 329, category: 'veg' },
      { id: 44, name: 'Potato Wedges', description: 'Crispy seasoned potato wedges', price: 329, category: 'veg' },
      { id: 45, name: 'Chilli Garlic Potato', description: 'Potatoes in chilli garlic sauce', price: 329, category: 'veg' },
      { id: 46, name: 'Cheese Garlic Bread', description: 'Garlic bread topped with cheese', price: 329, category: 'veg' },
      { id: 47, name: 'Onion Rings', description: 'Crispy fried onion rings', price: 359, category: 'veg' },
      { id: 48, name: 'Jalapeno Cheese Poppers', description: 'Jalapeno stuffed with cheese', price: 359, category: 'veg' },
      { id: 49, name: 'Extra Mayonnaise', description: 'Additional mayonnaise serving', price: 49, category: 'veg' },
      { id: 50, name: 'Special Party Package', description: 'Assorted party snacks package', price: 1300, category: 'veg' },
      { id: 51, name: 'Plain Nachos (MD)', description: 'Medium serving of plain nachos', price: 429, category: 'veg' },
      { id: 52, name: 'Green Salad (MD)', description: 'Medium serving of green salad', price: 379, category: 'veg' },
      { id: 53, name: 'Plain Curd', description: 'Fresh plain curd', price: 59, category: 'veg' },
    ],
    pizza: [
      { id: 54, name: 'Margherita Pizza', description: 'Classic tomato and mozzarella pizza', price: 439, category: 'veg' },
      { id: 55, name: 'Garden Fresh Pizza', description: 'Pizza loaded with fresh vegetables', price: 439, category: 'veg' },
      { id: 56, name: 'Paneer Tikka Pizza', description: 'Pizza topped with paneer tikka', price: 439, category: 'veg' },
      { id: 57, name: 'Chicken Tikka Pizza', description: 'Pizza topped with chicken tikka', price: 499, category: 'non-veg' },
      { id: 58, name: 'Chicken 65 Pizza', description: 'Pizza topped with chicken 65', price: 499, category: 'non-veg' },
      { id: 59, name: 'BBQ Chicken Pizza', description: 'Pizza with BBQ chicken and sauce', price: 499, category: 'non-veg' },
    ],
    pasta: [
      { id: 60, name: 'Alfredo Veg Pasta', description: 'Creamy alfredo pasta with vegetables', price: 379, category: 'veg' },
      { id: 61, name: 'Spaghetti Veg Pasta', description: 'Spaghetti pasta with vegetables', price: 379, category: 'veg' },
      { id: 62, name: 'Alfredo Chicken Pasta', description: 'Creamy alfredo pasta with chicken', price: 439, category: 'non-veg' },
      { id: 63, name: 'Spaghetti Chicken Pasta', description: 'Spaghetti pasta with chicken', price: 439, category: 'non-veg' },
    ],
    'main-course-veg': [
      { id: 64, name: 'Paneer Butter Masala', description: 'Creamy tomato curry with paneer', price: 379, category: 'veg' },
      { id: 65, name: 'Kadai Paneer', description: 'Paneer in spicy kadai masala', price: 379, category: 'veg' },
      { id: 66, name: 'Mix Veg Curry', description: 'Mixed vegetables in curry', price: 379, category: 'veg' },
      { id: 67, name: 'Mushroom Mutter Masala', description: 'Mushrooms and peas in masala', price: 379, category: 'veg' },
      { id: 68, name: 'Dal Makhani', description: 'Rich black lentils with cream', price: 379, category: 'veg' },
      { id: 69, name: 'Yellow Dal Tadka', description: 'Yellow lentils with tempering', price: 379, category: 'veg' },
    ],
    'main-course-non-veg': [
      { id: 70, name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 439, category: 'non-veg' },
      { id: 71, name: 'Kadai Chicken', description: 'Chicken in spicy kadai masala', price: 439, category: 'non-veg' },
      { id: 72, name: 'Andhra Chicken Curry', description: 'Spicy Andhra style chicken curry', price: 439, category: 'non-veg' },
      { id: 73, name: 'Andhra Fish Curry', description: 'Spicy Andhra style fish curry', price: 489, category: 'non-veg' },
      { id: 74, name: 'Grilled Chicken Breast', description: 'Tender grilled chicken breast', price: 489, category: 'non-veg' },
      { id: 75, name: 'Keema Mutter Curry', description: 'Minced meat with peas curry', price: 489, category: 'non-veg' },
      { id: 76, name: 'Mutton Rogan Josh', description: 'Aromatic lamb curry', price: 699, category: 'non-veg' },
    ],
    'rice-noodles': [
      { id: 77, name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 269, category: 'veg' },
      { id: 78, name: 'Fried Rice', description: 'Stir-fried basmati rice', price: 269, category: 'veg' },
      { id: 79, name: 'Steamed Rice', description: 'Plain steamed basmati rice', price: 199, category: 'veg' },
      { id: 80, name: 'Jeera Rice', description: 'Basmati rice tempered with cumin', price: 319, category: 'veg' },
      { id: 81, name: 'Ghee Rice', description: 'Basmati rice cooked in ghee', price: 319, category: 'veg' },
      { id: 82, name: 'Dal Khichdi', description: 'Rice and lentils cooked together', price: 319, category: 'veg' },
      { id: 83, name: 'Curd Rice', description: 'Rice mixed with curd and spices', price: 319, category: 'veg' },
      { id: 84, name: 'Mutton Biryani', description: 'Fragrant basmati rice with mutton', price: 699, category: 'non-veg' },
    ],
    pulao: [
      { id: 85, name: 'Subz Kesari Pulao', description: 'Vegetable pulao with saffron', price: 319, category: 'veg' },
      { id: 86, name: 'Kaju Moti Pulao', description: 'Pulao with cashews and pearls', price: 319, category: 'veg' },
      { id: 87, name: 'Egg Pulao', description: 'Pulao with boiled eggs', price: 379, category: 'non-veg' },
      { id: 88, name: 'Chicken Pulao', description: 'Fragrant pulao with chicken', price: 419, category: 'non-veg' },
      { id: 89, name: 'Prawns Pulao', description: 'Fragrant pulao with prawns', price: 529, category: 'non-veg' },
    ],
    breads: [
      { id: 90, name: 'Tandoori Roti (Plain/Butter)', description: 'Fresh tandoori roti', price: 65, category: 'veg' },
      { id: 91, name: 'Naan (Plain/Garlic/Butter)', description: 'Soft leavened bread', price: 80, category: 'veg' },
      { id: 92, name: 'Lachha Paratha', description: 'Layered flaky paratha', price: 149, category: 'veg' },
      { id: 93, name: 'MD Sir Outside Food 2230', description: 'Special outside food package', price: 2230, category: 'veg' },
    ],
    platters: [
      { id: 94, name: 'Veg Platter (5 Starters)', description: 'Assorted vegetarian starters platter', price: 2199, category: 'veg' },
      { id: 95, name: 'Non Veg Platter (5 Starters)', description: 'Assorted non-vegetarian starters platter', price: 2699, category: 'non-veg' },
    ],
    'chefs-special': [
      { id: 96, name: 'Threaded Chicken', description: 'Chicken cooked on skewers', price: 479, category: 'non-veg' },
      { id: 97, name: 'Coriander Chicken', description: 'Chicken with fresh coriander', price: 479, category: 'non-veg' },
      { id: 98, name: 'Kodi Chips', description: 'Crispy chicken chips', price: 549, category: 'non-veg' },
      { id: 99, name: 'Galouti Kebab', description: 'Melt-in-mouth minced meat kebab', price: 549, category: 'non-veg' },
      { id: 100, name: 'Chitti Muthyala Kheema Pulao', description: 'Special keema pulao with pearls', price: 519, category: 'non-veg' },
      { id: 101, name: 'Boiled Chicken 1 kg GSR', description: 'Boiled chicken 1 kilogram', price: 300, category: 'non-veg' },
      { id: 102, name: 'Mutton Seek Kebab', description: 'Mutton kebab on skewers', price: 699, category: 'non-veg' },
      { id: 103, name: 'Roast Lamb Chilli Pepper', description: 'Roasted lamb with chilli pepper', price: 699, category: 'non-veg' },
      { id: 104, name: 'Tangdi Kebab', description: 'Tandoori chicken drumsticks', price: 499, category: 'non-veg' },
      { id: 105, name: 'Mutton Ghee Roast', description: 'Mutton roasted in ghee', price: 699, category: 'non-veg' },
      { id: 106, name: 'Chicken Harissa', description: 'Spicy chicken harissa', price: 449, category: 'non-veg' },
      { id: 107, name: 'Mahi Fish Tikka', description: 'Grilled fish tikka', price: 549, category: 'non-veg' },
      { id: 108, name: 'Kasturi Kebab', description: 'Aromatic kasturi kebab', price: 429, category: 'non-veg' },
      { id: 109, name: 'Stuffed Paneer Tikka', description: 'Paneer tikka with stuffing', price: 429, category: 'veg' },
      { id: 110, name: 'Patiyala Aloo', description: 'Punjabi style spicy potatoes', price: 349, category: 'veg' },
    ],
    'nc': [
      { id: 111, name: 'Egg Fried Rice (Bouncer)', description: 'Egg fried rice special', price: 299, category: 'non-veg' },
      { id: 112, name: 'Chicken Curry with Bone (Bouncer)', description: 'Chicken curry with bones', price: 299, category: 'non-veg' },
      { id: 113, name: 'Mix Veg Curry (Bouncer)', description: 'Mixed vegetable curry', price: 199, category: 'veg' },
    ],
    'today-special': [
      { id: 114, name: 'Nawabi Paneer Tikka', description: 'Royal style paneer tikka', price: 449, category: 'veg' },
      { id: 115, name: 'Crispy Veg Tangy Sauce', description: 'Crispy vegetables in tangy sauce', price: 449, category: 'veg' },
      { id: 116, name: 'Chicken Fingers Hoisin Sauce', description: 'Chicken fingers with hoisin sauce', price: 499, category: 'non-veg' },
      { id: 117, name: 'Murg Lasooni Kebab', description: 'Garlic marinated chicken kebab', price: 499, category: 'non-veg' },
    ],
    desserts: [
      { id: 118, name: 'Gulab Jamun', description: 'Sweet milk dumplings in sugar syrup', price: 279, category: 'veg' },
      { id: 119, name: 'Chocolate Brownie', description: 'Rich chocolate brownie', price: 389, category: 'veg' },
      { id: 120, name: 'Vanilla Ice Cream with Caramel Nuts', description: 'Vanilla ice cream topped with caramel and nuts', price: 279, category: 'veg' },
      { id: 121, name: 'Brownie with Ice Cream', description: 'Chocolate brownie with ice cream', price: 439, category: 'veg' },
    ],
  },
  beverage: {
    mocktail: [
      { id: 122, name: 'Watermelon Refresher', description: 'Refreshing watermelon mocktail', price: 389, category: 'beverage' },
      { id: 123, name: 'Cucumber Tangi', description: 'Cool cucumber mocktail', price: 389, category: 'beverage' },
      { id: 124, name: 'Instant Ginger Punch', description: 'Spicy ginger mocktail', price: 389, category: 'beverage' },
      { id: 125, name: 'Beet Tonic', description: 'Healthy beetroot mocktail', price: 389, category: 'beverage' },
      { id: 126, name: 'Spice Herb Mojito', description: 'Herbal spiced mojito', price: 389, category: 'beverage' },
      { id: 127, name: 'Virgin Mojito', description: 'Classic mint mojito', price: 389, category: 'beverage' },
      { id: 128, name: 'Blue Angel', description: 'Blue curacao mocktail', price: 389, category: 'beverage' },
      { id: 129, name: 'Spl Mocktail @699', description: 'Special mocktail combo', price: 769, category: 'beverage' },
      { id: 130, name: 'Fruit Punch', description: 'Mixed fruit mocktail', price: 389, category: 'beverage' },
      { id: 131, name: 'Skyhy Spl Mocktail @1499', description: 'Premium Skyhy special mocktail', price: 1499, category: 'beverage' },
      { id: 132, name: 'Soda', description: 'Plain soda', price: 99, category: 'beverage' },
      { id: 133, name: 'Skyhy Jumbo Mocktails @1999', description: 'Jumbo size special mocktail', price: 1999, category: 'beverage' },
      { id: 134, name: 'Guava Mary', description: 'Guava mocktail', price: 389, category: 'beverage' },
      { id: 135, name: 'Spl Mocktail @3499', description: 'Premium special mocktail', price: 3499, category: 'beverage' },
    ],
    'fresh-juices': [
      { id: 136, name: 'Eat, Sleep, Rave Repeat', description: 'Energy boosting juice', price: 249, category: 'beverage' },
      { id: 137, name: 'Anti-Boost', description: 'Antioxidant rich juice', price: 249, category: 'beverage' },
      { id: 138, name: 'Fled Belly @ The Peace Of Muscle', description: 'Digestive health juice', price: 249, category: 'beverage' },
      { id: 139, name: 'No More Phil', description: 'Detox juice', price: 249, category: 'beverage' },
      { id: 140, name: 'Apple Carrot Beet', description: 'Fresh apple, carrot and beet juice', price: 249, category: 'beverage' },
      { id: 141, name: 'Skyhy Booster', description: 'Energy booster juice', price: 249, category: 'beverage' },
      { id: 142, name: 'The Pine Boost', description: 'Pineapple boost juice', price: 249, category: 'beverage' },
      { id: 143, name: 'Glowing Skin', description: 'Skin health juice', price: 249, category: 'beverage' },
      { id: 144, name: 'Kiik Thyroid Tonic', description: 'Thyroid support juice', price: 249, category: 'beverage' },
      { id: 145, name: 'Adams Bite', description: 'Apple based juice', price: 249, category: 'beverage' },
      { id: 146, name: 'Skyhy Fuel', description: 'Energy fuel juice', price: 249, category: 'beverage' },
      { id: 147, name: 'Hot And Spicy', description: 'Spicy detox juice', price: 249, category: 'beverage' },
      { id: 148, name: 'Refreshing Detox Juices', description: 'Detoxifying fresh juice', price: 249, category: 'beverage' },
    ],
    'ice-tea': [
      { id: 149, name: 'Ice Tea', description: 'Classic iced tea', price: 129, category: 'beverage' },
      { id: 150, name: 'Mojito Ice Tea', description: 'Mojito flavored iced tea', price: 149, category: 'beverage' },
    ],
    assortments: [
      { id: 151, name: 'Red Bull', description: 'Energy drink', price: 329, category: 'beverage' },
      { id: 152, name: 'Diet Coke', description: 'Diet cola', price: 139, category: 'beverage' },
      { id: 153, name: 'Tonic', description: 'Tonic water', price: 139, category: 'beverage' },
      { id: 154, name: 'Ginger Ale', description: 'Ginger ale', price: 139, category: 'beverage' },
      { id: 155, name: 'Canned Juice', description: 'Assorted canned juices', price: 109, category: 'beverage' },
      { id: 156, name: 'Fresh Lime Soda', description: 'Fresh lime with soda', price: 109, category: 'beverage' },
      { id: 157, name: 'Soft Drinks', description: 'Assorted soft drinks', price: 109, category: 'beverage' },
      { id: 158, name: 'Mineral Water', description: 'Bottled mineral water', price: 109, category: 'beverage' },
    ],
    'soft-drinks': [
      { id: 159, name: 'Soft Drink Bottles', description: 'Bottled soft drinks', price: 209, category: 'beverage' },
      { id: 160, name: 'Soda Bottle', description: 'Bottled soda', price: 209, category: 'beverage' },
      { id: 161, name: 'Pepsi Can', description: 'Pepsi in can', price: 120, category: 'beverage' },
      { id: 162, name: '7 Up Can', description: '7 Up in can', price: 120, category: 'beverage' },
    ],
    'beverage-today-special': [
      { id: 163, name: 'Sunrise Orange Mocktail', description: 'Orange sunrise mocktail', price: 399, category: 'beverage' },
    ],
  },
  liquor: {
    'single-malt': [
      { id: 164, name: 'The Glenlivet', description: 'Premium single malt scotch', price: 769, category: 'liquor' },
      { id: 165, name: 'Glenfiddich 12yrs 30ml', description: '12 year old single malt 30ml', price: 769, category: 'liquor' },
      { id: 166, name: 'Glenfiddich 12yrs (Bottle)', description: '12 year old single malt bottle', price: 16499, category: 'liquor' },
      { id: 167, name: 'Chivas Regal 18Yrs (Bottle)', description: '18 year old premium scotch bottle', price: 17999, category: 'liquor' },
      { id: 168, name: 'Taliskar Bottle', description: 'Talisker single malt bottle', price: 16499, category: 'liquor' },
      { id: 169, name: 'The Glenlivet 15 yrs 30 ml', description: '15 year old single malt 30ml', price: 769, category: 'liquor' },
      { id: 170, name: 'The Glenlivet 15 yrs BTL', description: '15 year old single malt bottle', price: 17999, category: 'liquor' },
      { id: 171, name: 'The Glenlevit BTL', description: 'Glenlivet bottle', price: 16499, category: 'liquor' },
      { id: 172, name: 'Glenreidh 30ml', description: 'Glenreidh single malt 30ml', price: 659, category: 'liquor' },
      { id: 173, name: 'Glenreidh BTL', description: 'Glenreidh single malt bottle', price: 15499, category: 'liquor' },
      { id: 174, name: 'Glenlivet 12y MRP BTL', description: '12 year old MRP bottle', price: 7070, category: 'liquor' },
      { id: 175, name: 'Paul John BTL', description: 'Paul John single malt bottle', price: 7999, category: 'liquor' },
      { id: 176, name: 'Paul John 30ML', description: 'Paul John single malt 30ml', price: 439, category: 'liquor' },
      { id: 177, name: 'Glenfiddich 15Y', description: '15 year old single malt', price: 19999, category: 'liquor' },
    ],
    scotch: [
      { id: 178, name: 'Chivas Regal 18Yrs', description: '18 year old premium scotch', price: 879, category: 'liquor' },
      { id: 179, name: 'JW Gold Label', description: 'Johnnie Walker Gold Label', price: 769, category: 'liquor' },
      { id: 180, name: 'Chivas Regal 12Yrs', description: '12 year old scotch', price: 549, category: 'liquor' },
      { id: 181, name: 'JW Black Label 30ml', description: 'Johnnie Walker Black Label 30ml', price: 549, category: 'liquor' },
      { id: 182, name: 'Double Black Label', description: 'Johnnie Walker Double Black', price: 549, category: 'liquor' },
      { id: 183, name: 'Ballantine Finest', description: 'Ballantine\'s Finest scotch', price: 389, category: 'liquor' },
      { id: 184, name: 'Red Label', description: 'Johnnie Walker Red Label', price: 389, category: 'liquor' },
      { id: 185, name: '100 Pipers 30ml', description: '100 Pipers scotch 30ml', price: 329, category: 'liquor' },
      { id: 186, name: 'Black Dog 8yrs', description: '8 year old Black Dog scotch', price: 329, category: 'liquor' },
      { id: 187, name: 'Jim Beam', description: 'Jim Beam bourbon', price: 389, category: 'liquor' },
      { id: 188, name: 'Toki', description: 'Suntory Toki whiskey', price: 699, category: 'liquor' },
      { id: 189, name: 'Royal Salute 30ML', description: 'Royal Salute scotch 30ml', price: 1979, category: 'liquor' },
      { id: 190, name: 'Monkey Shoulder 30ml', description: 'Monkey Shoulder scotch 30ml', price: 709, category: 'liquor' },
      { id: 191, name: 'Monkey Shoulder Bottle', description: 'Monkey Shoulder scotch bottle', price: 16499, category: 'liquor' },
      { id: 192, name: 'Red Label Bottle', description: 'Johnnie Walker Red Label bottle', price: 7999, category: 'liquor' },
      { id: 193, name: 'JW Black Label (Bottle)', description: 'Johnnie Walker Black Label bottle', price: 10999, category: 'liquor' },
      { id: 194, name: 'JW Gold Label (Bottle)', description: 'Johnnie Walker Gold Label bottle', price: 16499, category: 'liquor' },
      { id: 195, name: 'Black Dog 8yrs BTL', description: '8 year old Black Dog bottle', price: 7999, category: 'liquor' },
      { id: 196, name: 'Dewars White Label BTL', description: 'Dewar\'s White Label bottle', price: 7699, category: 'liquor' },
      { id: 197, name: 'Glenriddich 30ML MRP', description: 'Glenriddich 30ml MRP', price: 200, category: 'liquor' },
      { id: 198, name: 'Rock Ford LA', description: 'Rock Ford scotch', price: 1300, category: 'liquor' },
      { id: 199, name: 'Dewars White Label 30ML', description: 'Dewar\'s White Label 30ml', price: 359, category: 'liquor' },
    ],
    'blended-scotch-domestic': [
      { id: 200, name: 'Teachers 50', description: 'Teachers 50 scotch', price: 399, category: 'liquor' },
      { id: 201, name: 'Black Dog 12Yrs', description: '12 year old Black Dog scotch', price: 369, category: 'liquor' },
      { id: 202, name: 'Teachers Highland', description: 'Teachers Highland scotch', price: 299, category: 'liquor' },
      { id: 203, name: 'Black Dog Centenary', description: 'Black Dog Centenary scotch', price: 299, category: 'liquor' },
      { id: 204, name: '100 Pipers Bottle', description: '100 Pipers scotch bottle', price: 5999, category: 'liquor' },
      { id: 205, name: 'Blenders Pride', description: 'Blenders Pride scotch', price: 299, category: 'liquor' },
      { id: 206, name: 'Royal Challenge', description: 'Royal Challenge scotch', price: 129, category: 'liquor' },
      { id: 207, name: '100 Pipers 12Y', description: '12 year old 100 Pipers', price: 369, category: 'liquor' },
      { id: 208, name: 'Something Special', description: 'Something Special scotch', price: 369, category: 'liquor' },
      { id: 209, name: 'Grants', description: 'Grant\'s scotch', price: 7699, category: 'liquor' },
      { id: 210, name: 'Grant\'s Triple Wood', description: 'Grant\'s Triple Wood scotch', price: 8799, category: 'liquor' },
      { id: 211, name: 'Jack Daniels Cinnamon BTL', description: 'Jack Daniels Cinnamon bottle', price: 8799, category: 'liquor' },
      { id: 212, name: '100 Pipers 8Y BTL', description: '8 year old 100 Pipers bottle', price: 7699, category: 'liquor' },
      { id: 213, name: '100 Pipers 8yrs 30 ml', description: '8 year old 100 Pipers 30ml', price: 349, category: 'liquor' },
      { id: 214, name: 'Legacy 30ML', description: 'Legacy scotch 30ml', price: 269, category: 'liquor' },
      { id: 215, name: 'Legacy Bottle', description: 'Legacy scotch bottle', price: 5499, category: 'liquor' },
    ],
    'american-irish-whiskey': [
      { id: 216, name: 'Jack Daniels', description: 'Jack Daniels Tennessee whiskey', price: 469, category: 'liquor' },
      { id: 217, name: 'Jameson', description: 'Jameson Irish whiskey', price: 499, category: 'liquor' },
      { id: 218, name: 'Gentleman Jack 30ML', description: 'Gentleman Jack 30ml', price: 709, category: 'liquor' },
      { id: 219, name: 'Gentleman Jack Bottle', description: 'Gentleman Jack bottle', price: 15999, category: 'liquor' },
      { id: 220, name: 'Glenfiddich 15yrs BTL', description: '15 year old Glenfiddich bottle', price: 19999, category: 'liquor' },
    ],
    vodka: [
      { id: 221, name: 'Grey Goose', description: 'Premium French vodka', price: 599, category: 'liquor' },
      { id: 222, name: 'Ketal One', description: 'Ketel One vodka', price: 379, category: 'liquor' },
      { id: 223, name: 'Absolut', description: 'Absolut vodka', price: 379, category: 'liquor' },
      { id: 224, name: 'Smirnoff Vodka', description: 'Smirnoff vodka', price: 219, category: 'liquor' },
      { id: 225, name: 'Class Vodka 30ml', description: 'Class vodka 30ml', price: 129, category: 'liquor' },
    ],
    gin: [
      { id: 226, name: 'Bombay Sapphire', description: 'Bombay Sapphire gin', price: 379, category: 'liquor' },
      { id: 227, name: 'Roku Gin 30ML', description: 'Roku gin 30ml', price: 769, category: 'liquor' },
      { id: 228, name: 'Hendrick\'s 30ML', description: 'Hendrick\'s gin 30ml', price: 639, category: 'liquor' },
      { id: 229, name: 'Hendrick\'s BTL', description: 'Hendrick\'s gin bottle', price: 14999, category: 'liquor' },
      { id: 230, name: 'Great India BTL', description: 'Great India gin bottle', price: 4999, category: 'liquor' },
      { id: 231, name: 'Great India 30ML', description: 'Great India gin 30ml', price: 269, category: 'liquor' },
    ],
    brandy: [
      { id: 232, name: 'Mansion House', description: 'Mansion House brandy', price: 219, category: 'liquor' },
      { id: 233, name: 'Mansion House Brandy 30ML MRP', description: 'Mansion House brandy 30ml MRP', price: 28, category: 'liquor' },
      { id: 234, name: 'Kyron 30ML', description: 'Kyron brandy 30ml', price: 219, category: 'liquor' },
      { id: 235, name: 'Kyron @ (BTL)', description: 'Kyron brandy bottle', price: 4999, category: 'liquor' },
      { id: 236, name: 'St Remy VSOP BTL', description: 'St Remy VSOP brandy bottle', price: 8249, category: 'liquor' },
      { id: 237, name: 'St-Remy 30ML', description: 'St Remy brandy 30ml', price: 369, category: 'liquor' },
    ],
    cognac: [
      { id: 238, name: 'Remy Martini VSOP', description: 'Remy Martin VSOP cognac', price: 709, category: 'liquor' },
      { id: 239, name: 'Water Bottle MRP', description: 'Water bottle MRP', price: 14, category: 'beverage' },
    ],
    rum: [
      { id: 240, name: 'Bacardi', description: 'Bacardi white rum', price: 269, category: 'liquor' },
      { id: 241, name: 'Old Monk', description: 'Old Monk dark rum', price: 219, category: 'liquor' },
    ],
    tequila: [
      { id: 242, name: 'Tequila Gold', description: 'Gold tequila', price: 649, category: 'liquor' },
      { id: 243, name: 'Tequila Silver', description: 'Silver tequila', price: 499, category: 'liquor' },
      { id: 244, name: 'Talisker 30ml', description: 'Talisker 30ml', price: 769, category: 'liquor' },
      { id: 245, name: 'Triple Sec', description: 'Triple sec liqueur', price: 5199, category: 'liquor' },
    ],
    liqueurs: [
      { id: 246, name: 'Baileys', description: 'Baileys Irish cream', price: 549, category: 'liquor' },
      { id: 247, name: 'Cointreau', description: 'Cointreau orange liqueur', price: 379, category: 'liquor' },
      { id: 248, name: 'Kahlua 30ml', description: 'Kahlua coffee liqueur 30ml', price: 379, category: 'liquor' },
      { id: 249, name: 'Jagermeister', description: 'Jagermeister herbal liqueur', price: 549, category: 'liquor' },
      { id: 250, name: 'Sambuca', description: 'Sambuca anise liqueur', price: 549, category: 'liquor' },
      { id: 251, name: 'Buen Amigo-Tequila BOT', description: 'Buen Amigo tequila bottle', price: 8799, category: 'liquor' },
      { id: 252, name: 'Jose Cuervo BTL', description: 'Jose Cuervo tequila bottle', price: 9899, category: 'liquor' },
      { id: 253, name: 'LIIT-SPL @999', description: 'Long Island Iced Tea special', price: 1099, category: 'liquor' },
      { id: 254, name: 'Singleton BTL', description: 'Singleton scotch bottle', price: 18699, category: 'liquor' },
      { id: 255, name: 'Singleton 30ML', description: 'Singleton scotch 30ml', price: 819, category: 'liquor' },
      { id: 256, name: 'Glen Grant', description: 'Glen Grant scotch', price: 18499, category: 'liquor' },
      { id: 257, name: 'Dewars 8y', description: '8 year old Dewar\'s', price: 360, category: 'liquor' },
      { id: 258, name: 'Jagermeister 6 Shorts', description: 'Jagermeister 6 shot pack', price: 3099, category: 'liquor' },
      { id: 259, name: 'Jagerbomb 6 Shorts', description: 'Jagerbomb 6 shot pack', price: 4999, category: 'liquor' },
    ],
    'wine-sparkling': [
      { id: 260, name: 'Jacob\'s Creek Shiraz', description: 'Jacob\'s Creek Shiraz wine', price: 929, category: 'liquor' },
      { id: 261, name: 'Jacob\'s Creek Chardonnay', description: 'Jacob\'s Creek Chardonnay wine', price: 929, category: 'liquor' },
      { id: 262, name: 'Jacob\'s Creek Shiraz Bottle', description: 'Jacob\'s Creek Shiraz bottle', price: 4999, category: 'liquor' },
      { id: 263, name: 'Bushmills Irish Whiskey', description: 'Bushmills Irish whiskey', price: 399, category: 'liquor' },
    ],
    'wine-domestic': [
      { id: 264, name: 'Sula White/Red', description: 'Sula wine white or red', price: 899, category: 'liquor' },
      { id: 265, name: 'Oaken Glow 30ml', description: 'Oaken Glow 30ml', price: 359, category: 'liquor' },
      { id: 266, name: 'Kyra Red Bottle', description: 'Kyra red wine bottle', price: 2999, category: 'liquor' },
    ],
    'sparkling-wines': [
      { id: 267, name: 'Jacobs Creek Chardonnay Pinot Noir', description: 'Sparkling wine', price: 7699, category: 'liquor' },
      { id: 268, name: 'Sula Brut', description: 'Sula Brut sparkling wine', price: 4999, category: 'liquor' },
      { id: 269, name: 'Asav-Brut', description: 'Asav Brut sparkling wine', price: 4999, category: 'liquor' },
    ],
    alcopop: [
      { id: 270, name: 'Bacardi Breezer', description: 'Bacardi Breezer alcopop', price: 329, category: 'liquor' },
    ],
    'tap-beer': [
      { id: 271, name: 'Heineken', description: 'Heineken tap beer', price: 399, category: 'liquor' },
      { id: 272, name: 'Ultra Max', description: 'Ultra Max beer', price: 379, category: 'liquor' },
      { id: 273, name: 'Ultra Max Bucket (6)', description: 'Ultra Max 6 pack bucket', price: 2174, category: 'liquor' },
      { id: 274, name: 'Budweiser Magnum Bucket (6)', description: 'Budweiser Magnum 6 pack bucket', price: 2174, category: 'liquor' },
      { id: 275, name: 'Heineken Bucket (6)', description: 'Heineken 6 pack bucket', price: 2249, category: 'liquor' },
      { id: 276, name: 'KF Ultra 500ml Can', description: 'Kingfisher Ultra 500ml can', price: 459, category: 'liquor' },
    ],
    shooters: [
      { id: 277, name: 'Jagerbomb', description: 'Jagerbomb shooter', price: 879, category: 'liquor' },
      { id: 278, name: 'B52', description: 'B52 layered shooter', price: 659, category: 'liquor' },
      { id: 279, name: 'Kamikaze', description: 'Kamikaze shooter', price: 549, category: 'liquor' },
      { id: 280, name: 'Flamming Lamborghini', description: 'Flaming Lamborghini shooter', price: 2399, category: 'liquor' },
      { id: 281, name: 'Kamakaze-G', description: 'Kamikaze-G shooter', price: 699, category: 'liquor' },
    ],
    sangria: [
      { id: 282, name: 'Red Wine Sangria', description: 'Red wine sangria', price: 999, category: 'liquor' },
      { id: 283, name: 'White Wine Sangria', description: 'White wine sangria', price: 999, category: 'liquor' },
    ],
    'classic-cocktails': [
      { id: 284, name: 'Margarita', description: 'Classic margarita cocktail', price: 649, category: 'liquor' },
      { id: 285, name: 'Cosmopolitan', description: 'Cosmopolitan cocktail', price: 599, category: 'liquor' },
      { id: 286, name: 'Martini', description: 'Classic martini', price: 599, category: 'liquor' },
      { id: 287, name: 'Mojito', description: 'Classic mojito cocktail', price: 599, category: 'liquor' },
      { id: 288, name: 'Long Island Ice Tea / Pitcher', description: 'Long Island Iced Tea', price: 649, category: 'liquor' },
      { id: 289, name: 'Caprioska', description: 'Caprioska cocktail', price: 599, category: 'liquor' },
      { id: 290, name: 'Whiskey Sour', description: 'Whiskey sour cocktail', price: 599, category: 'liquor' },
      { id: 291, name: 'Daiquiri', description: 'Daiquiri cocktail', price: 599, category: 'liquor' },
      { id: 292, name: 'Bloody Mary', description: 'Bloody Mary cocktail', price: 599, category: 'liquor' },
      { id: 293, name: 'Hot Toddy', description: 'Hot toddy cocktail', price: 599, category: 'liquor' },
      { id: 294, name: 'Spl Cocktails @799', description: 'Special cocktails combo', price: 799, category: 'liquor' },
      { id: 295, name: 'Manhattan', description: 'Manhattan cocktail', price: 649, category: 'liquor' },
      { id: 296, name: 'Old Fashion', description: 'Old Fashioned cocktail', price: 649, category: 'liquor' },
      { id: 297, name: 'Negroni', description: 'Negroni cocktail', price: 649, category: 'liquor' },
      { id: 298, name: 'Valentine\'s Spl Cocktail @699', description: 'Valentine\'s special cocktail', price: 699, category: 'liquor' },
      { id: 299, name: 'Peach Fizz', description: 'Peach fizz cocktail', price: 599, category: 'liquor' },
      { id: 300, name: 'Basil Smash', description: 'Basil smash cocktail', price: 599, category: 'liquor' },
      { id: 301, name: 'Innocent', description: 'Innocent cocktail', price: 599, category: 'liquor' },
      { id: 302, name: 'Indian Sour', description: 'Indian sour cocktail', price: 599, category: 'liquor' },
      { id: 303, name: 'Passionate', description: 'Passionate cocktail', price: 599, category: 'liquor' },
      { id: 304, name: 'Mery Coco', description: 'Mery coco cocktail', price: 599, category: 'liquor' },
      { id: 305, name: 'Caramel Sour', description: 'Caramel sour cocktail', price: 599, category: 'liquor' },
      { id: 306, name: 'Story of Customer', description: 'Story of customer cocktail', price: 599, category: 'liquor' },
      { id: 307, name: 'Salted Popcorn Tini', description: 'Salted popcorn martini', price: 599, category: 'liquor' },
      { id: 308, name: 'Tamarind Teen', description: 'Tamarind teen cocktail', price: 599, category: 'liquor' },
    ],
    'signature-cocktail': [
      { id: 309, name: 'Aged Ice Tea', description: 'Aged iced tea cocktail', price: 699, category: 'liquor' },
      { id: 310, name: 'Ginger And Star Anise', description: 'Ginger and star anise cocktail', price: 599, category: 'liquor' },
      { id: 311, name: 'Nutmeg Old Fashioned', description: 'Nutmeg old fashioned cocktail', price: 699, category: 'liquor' },
      { id: 312, name: 'Smokey Hibiscus', description: 'Smokey hibiscus cocktail', price: 699, category: 'liquor' },
      { id: 313, name: 'Jalisco Lemonade', description: 'Jalisco lemonade cocktail', price: 599, category: 'liquor' },
      { id: 314, name: 'Apple Ciga', description: 'Apple ciga cocktail', price: 599, category: 'liquor' },
      { id: 315, name: 'Shyhy Treat Off', description: 'Skyhy special treat cocktail', price: 599, category: 'liquor' },
      { id: 316, name: 'Golden Dragon', description: 'Golden dragon cocktail', price: 599, category: 'liquor' },
      { id: 317, name: 'Botanical Aged Sangria', description: 'Botanical aged sangria', price: 599, category: 'liquor' },
      { id: 318, name: 'LIIT SPL', description: 'Long Island Iced Tea special', price: 2999, category: 'liquor' },
      { id: 319, name: 'Sprkling Cucumber', description: 'Sparkling cucumber cocktail', price: 559, category: 'liquor' },
    ],
    'beers-served': [
      { id: 320, name: 'Hoegaraden', description: 'Hoegaarden beer', price: 679, category: 'liquor' },
      { id: 321, name: 'Corona Extra', description: 'Corona Extra beer', price: 639, category: 'liquor' },
      { id: 322, name: 'Bira White', description: 'Bira White beer', price: 549, category: 'liquor' },
      { id: 323, name: 'Bira Blonde', description: 'Bira Blonde beer', price: 439, category: 'liquor' },
      { id: 324, name: 'Budweiser', description: 'Budweiser beer', price: 349, category: 'liquor' },
      { id: 325, name: 'Budweiser Magnum', description: 'Budweiser Magnum beer', price: 379, category: 'liquor' },
      { id: 326, name: 'Tuborg', description: 'Tuborg beer', price: 249, category: 'liquor' },
      { id: 327, name: 'Carlsberg', description: 'Carlsberg beer', price: 225, category: 'liquor' },
      { id: 328, name: 'K F Ultra Witbier', description: 'Kingfisher Ultra Witbier', price: 439, category: 'liquor' },
      { id: 329, name: 'K F Ultra Witbier', description: 'Kingfisher Ultra Witbier', price: 180, category: 'liquor' },
      { id: 330, name: 'Budweiser 500 Can', description: 'Budweiser 500ml can', price: 459, category: 'liquor' },
      { id: 331, name: 'Budweiser 500ML Tin Bucket', description: 'Budweiser 500ml tin bucket', price: 2649, category: 'liquor' },
      { id: 332, name: 'Budweiser 500ML Can MRP', description: 'Budweiser 500ml can MRP', price: 160, category: 'liquor' },
      { id: 333, name: 'Budweiser Magnum Tin 500 ml', description: 'Budweiser Magnum 500ml tin', price: 459, category: 'liquor' },
      { id: 334, name: 'KF Ultra', description: 'Kingfisher Ultra beer', price: 349, category: 'liquor' },
    ],
    'liquor-today-special': [
      { id: 335, name: 'Spl Cocktail Brazilian Babe', description: 'Special Brazilian babe cocktail', price: 549, category: 'liquor' },
      { id: 336, name: 'Blue Ocean', description: 'Blue ocean cocktail', price: 549, category: 'liquor' },
    ],
    'bacardi-spl': [
      { id: 337, name: 'Bacardi Spiked Lemonade', description: 'Bacardi spiked lemonade', price: 2299, category: 'liquor' },
      { id: 338, name: 'Bacardi Classic Mojito', description: 'Bacardi classic mojito', price: 2299, category: 'liquor' },
      { id: 339, name: 'Bacardi Cuba Libre', description: 'Bacardi Cuba Libre', price: 2299, category: 'liquor' },
    ],
  },
  store: {
    smoke: [
      { id: 340, name: 'Smoke 10s', description: 'Cigarette pack 10s', price: 300, category: 'store' },
      { id: 341, name: 'Smoke 20s', description: 'Cigarette pack 20s', price: 600, category: 'store' },
      { id: 342, name: 'Smoke 20s MRP', description: 'Cigarette pack 20s MRP', price: 300, category: 'store' },
      { id: 343, name: 'Smoke 10s MRP', description: 'Cigarette pack 10s MRP', price: 200, category: 'store' },
    ],
  },
  'special-128': {
    drinks: [
      { id: 344, name: 'Dewars White Label', description: 'Premium blended scotch whisky', price: 128, category: 'liquor' },
      { id: 345, name: 'Smirnoff Vodka', description: 'Classic vodka', price: 128, category: 'liquor' },
      { id: 346, name: 'Bacardi Rum (White/Black/Mango Chilly/Ginger/Orange/Lemon)', description: 'Premium rum in various flavors', price: 128, category: 'liquor' },
      { id: 347, name: 'Old Monk Legend Rum', description: 'Legendary dark rum', price: 128, category: 'liquor' },
      { id: 348, name: 'Kyron Brandy', description: 'Smooth brandy', price: 128, category: 'liquor' },
      { id: 349, name: 'Great Indian Gin', description: 'Premium Indian gin', price: 128, category: 'liquor' },
      { id: 350, name: 'KF Premium Draught Beer (330ml)', description: 'Premium draught beer', price: 128, category: 'liquor' },
      { id: 351, name: 'DesmondJi Tequila 51% Agave', description: 'Premium tequila with 51% agave', price: 128, category: 'liquor' },
    ],
    cocktails: [
      { id: 352, name: 'Whiskey Sour', description: 'Classic whiskey sour cocktail', price: 128, category: 'liquor' },
      { id: 353, name: 'Caipiroska', description: 'Vodka caipirinha style cocktail', price: 128, category: 'liquor' },
      { id: 354, name: 'Cosmopolitan', description: 'Vodka cranberry cocktail', price: 128, category: 'liquor' },
      { id: 355, name: 'Mojito', description: 'Classic mint mojito', price: 128, category: 'liquor' },
      { id: 356, name: 'Daiquiri', description: 'Rum daiquiri cocktail', price: 128, category: 'liquor' },
      { id: 357, name: 'Gimlet', description: 'Gin gimlet cocktail', price: 128, category: 'liquor' },
    ],
    'kf-beer': [
      { id: 358, name: 'KF Ultra', description: 'Kingfisher Ultra beer', price: 189, category: 'liquor' },
      { id: 359, name: 'KF Ultra Max', description: 'Kingfisher Ultra Max beer', price: 199, category: 'liquor' },
      { id: 360, name: 'KF Ultra Wit', description: 'Kingfisher Ultra Wit beer', price: 269, category: 'liquor' },
    ],
    mocktails: [
      { id: 361, name: 'Nojito', description: 'Virgin mojito mocktail', price: 128, category: 'beverage' },
      { id: 362, name: 'Blue Angel', description: 'Blue curacao mocktail', price: 128, category: 'beverage' },
      { id: 363, name: 'Strawberry Colada', description: 'Strawberry pina colada mocktail', price: 128, category: 'beverage' },
      { id: 364, name: 'Virgin Guava Marry', description: 'Guava mocktail', price: 128, category: 'beverage' },
      { id: 365, name: 'Mango Bloom', description: 'Mango mocktail', price: 128, category: 'beverage' },
      { id: 366, name: 'Cold Pressed Juices', description: 'Fresh cold pressed juices', price: 128, category: 'beverage' },
    ],
    'non-veg': [
      { id: 367, name: 'Murgh Tikka (3pcs)', description: 'Tandoori chicken tikka', price: 128, category: 'non-veg' },
      { id: 368, name: 'Murgh Seekh Kebab (1pc)', description: 'Chicken seekh kebab', price: 128, category: 'non-veg' },
      { id: 369, name: 'Kodi Vepudu', description: 'Andhra style spicy chicken fry', price: 128, category: 'non-veg' },
      { id: 370, name: 'Mirayala Kodi Vepudu', description: 'Andhra style chicken with pearl onions', price: 128, category: 'non-veg' },
      { id: 371, name: 'Chicken Ghee Roast', description: 'Chicken roasted in ghee', price: 128, category: 'non-veg' },
      { id: 372, name: 'Chicken Pakoda', description: 'Crispy chicken pakoda', price: 128, category: 'non-veg' },
      { id: 373, name: 'Dhaba Fried Chicken', description: 'Dhaba style fried chicken', price: 128, category: 'non-veg' },
      { id: 374, name: 'Pepper Chicken', description: 'Chicken in black pepper sauce', price: 128, category: 'non-veg' },
      { id: 375, name: 'Chicken 65', description: 'Spicy deep-fried chicken', price: 128, category: 'non-veg' },
      { id: 376, name: 'Chicken Shanghai Rolls', description: 'Crispy chicken Shanghai rolls', price: 128, category: 'non-veg' },
      { id: 377, name: 'Chicken Nuggets', description: 'Crispy chicken nuggets', price: 128, category: 'non-veg' },
      { id: 378, name: 'Chicken Popcorn', description: 'Bite-sized chicken popcorn', price: 128, category: 'non-veg' },
      { id: 379, name: 'Crispy Fried Chicken (3pcs)', description: 'Golden crispy fried chicken', price: 128, category: 'non-veg' },
      { id: 380, name: 'Peri Peri Chicken Wings (4pcs)', description: 'Spicy peri peri chicken wings', price: 128, category: 'non-veg' },
      { id: 381, name: 'Crispy Fried Wings (4pcs)', description: 'Crispy fried chicken wings', price: 128, category: 'non-veg' },
      { id: 382, name: 'Thai Pai Chicken', description: 'Thai style chicken', price: 128, category: 'non-veg' },
      { id: 383, name: 'Thai Chilli Fish', description: 'Fish in Thai chilli sauce', price: 128, category: 'non-veg' },
      { id: 384, name: 'Apollo Fish', description: 'Crispy fish in tangy sauce', price: 128, category: 'non-veg' },
      { id: 385, name: 'Crispy Fried Fish (3pcs)', description: 'Golden crispy fried fish', price: 128, category: 'non-veg' },
    ],
    'veg-egg': [
      { id: 386, name: 'Peanut Masala (Boiled/Fry)', description: 'Spiced peanuts', price: 128, category: 'veg' },
      { id: 387, name: 'Onion Rings (5pcs)', description: 'Crispy fried onion rings', price: 128, category: 'veg' },
      { id: 388, name: 'Veg Nuggets', description: 'Vegetable nuggets', price: 128, category: 'veg' },
      { id: 389, name: 'Green Salad', description: 'Fresh mixed greens', price: 128, category: 'veg' },
      { id: 390, name: 'Cheese Garlic Bread (3pcs)', description: 'Garlic bread with cheese', price: 128, category: 'veg' },
      { id: 391, name: 'Crispy Corn', description: 'Golden fried corn', price: 128, category: 'veg' },
      { id: 392, name: 'Corn Tikki (4pcs)', description: 'Corn cutlets', price: 128, category: 'veg' },
      { id: 393, name: 'Corn Cheese Bites (4pcs)', description: 'Corn and cheese bites', price: 128, category: 'veg' },
      { id: 394, name: 'French Fries (Salted / Peri Peri)', description: 'Crispy french fries', price: 128, category: 'veg' },
      { id: 395, name: 'Potato Wedges', description: 'Seasoned potato wedges', price: 128, category: 'veg' },
      { id: 396, name: 'Hara Bhara Kebab (4pcs)', description: 'Green vegetable kebabs', price: 128, category: 'veg' },
      { id: 397, name: 'Tandoori Gobi (4pcs)', description: 'Tandoori cauliflower', price: 128, category: 'veg' },
      { id: 398, name: 'Paneer Tikka (3pcs)', description: 'Grilled paneer tikka', price: 128, category: 'veg' },
      { id: 399, name: 'Manchurian (Veg/Gobi)', description: 'Crispy vegetable manchurian', price: 128, category: 'veg' },
      { id: 400, name: '65 (Gobi/Paneer/Aloo/Egg)', description: 'Spicy 65 style', price: 128, category: 'non-veg' },
      { id: 401, name: 'Chilli (Paneer/Egg)', description: 'Chilli paneer or egg', price: 128, category: 'veg' },
    ],
  },
};

function PackagesMenuPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'packages' | 'menu'>(
    tabParam === 'menu' ? 'menu' : 'packages'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu-specific state (only used when menu tab is active)
  const [activeSection, setActiveSection] = useState('food');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

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
  const currentItems = useMemo(() => {
    // Get all items from current section
    let allItems: MenuItem[] = [];
    if (activeSection === 'food') {
      Object.values(menuData.food).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'beverage') {
      Object.values(menuData.beverage).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'liquor') {
      Object.values(menuData.liquor).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'store') {
      Object.values(menuData.store).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'special-128') {
      Object.values(menuData['special-128']).forEach(category => {
        allItems = [...allItems, ...category];
      });
    }
    
    let filteredItems = allItems;
    if (selectedCategories.length > 0) {
      const categoryMap: { [key: string]: MenuItem[] } = {};
      
      // Get categories for current section
      let cats: string[] = [];
      if (activeSection === 'food') {
        cats = Object.keys(menuData.food);
      } else if (activeSection === 'beverage') {
        cats = Object.keys(menuData.beverage);
      } else if (activeSection === 'liquor') {
        cats = Object.keys(menuData.liquor);
      } else if (activeSection === 'store') {
        cats = Object.keys(menuData.store);
      } else if (activeSection === 'special-128') {
        cats = Object.keys(menuData['special-128']);
      }
      
      cats.forEach(cat => {
        if (activeSection === 'food') {
          categoryMap[cat] = menuData.food[cat as keyof typeof menuData.food] || [];
        } else if (activeSection === 'beverage') {
          categoryMap[cat] = menuData.beverage[cat as keyof typeof menuData.beverage] || [];
        } else if (activeSection === 'liquor') {
          categoryMap[cat] = menuData.liquor[cat as keyof typeof menuData.liquor] || [];
        } else if (activeSection === 'store') {
          categoryMap[cat] = menuData.store[cat as keyof typeof menuData.store] || [];
        } else if (activeSection === 'special-128') {
          categoryMap[cat] = menuData['special-128'][cat as keyof typeof menuData['special-128']] || [];
        }
      });
      
      filteredItems = selectedCategories.flatMap(cat => categoryMap[cat] || []);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    return filteredItems;
  }, [activeSection, selectedCategories, searchQuery]);

  const categories = useMemo(() => {
    if (activeSection === 'food') {
      return Object.keys(menuData.food);
    } else if (activeSection === 'beverage') {
      return Object.keys(menuData.beverage);
    } else if (activeSection === 'liquor') {
      return Object.keys(menuData.liquor);
    } else if (activeSection === 'store') {
      return Object.keys(menuData.store);
    } else if (activeSection === 'special-128') {
      return Object.keys(menuData['special-128']);
    }
    return [];
  }, [activeSection]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    // Get all items from current section
    let allItems: MenuItem[] = [];
    if (activeSection === 'food') {
      Object.values(menuData.food).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'beverage') {
      Object.values(menuData.beverage).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'liquor') {
      Object.values(menuData.liquor).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'store') {
      Object.values(menuData.store).forEach(category => {
        allItems = [...allItems, ...category];
      });
    } else if (activeSection === 'special-128') {
      Object.values(menuData['special-128']).forEach(category => {
        allItems = [...allItems, ...category];
      });
    }
    
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, activeSection]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    setSelectedCategories([]);
    setSearchQuery('');
    setIsCategoryDropdownOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-black">
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
                href="/reservation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Reservation
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
                
                <Link href="/reservation">
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
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
          <Link href="/reservation">
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

      {/* Floating Cart Button at Bottom */}
      {activeTab === 'menu' && getCartCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:w-auto md:max-w-md">
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
