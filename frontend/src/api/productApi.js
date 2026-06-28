import apiClient from './apiClient';

const dummyProducts = [
  {
    id: 1,
    strName: "Developer Hoodie - Dark Mode",
    strCategory: "Apparel",
    strDescription: "Premium heavyweight cotton hoodie. Perfect for late night coding sessions.",
    numPrice: 45.00,
    strImageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  },
  {
    id: 2,
    strName: "Synapse Logo Tee",
    strCategory: "Apparel",
    strDescription: "Comfortable minimalist t-shirt featuring the subtle Synapse emblem.",
    numPrice: 25.00,
    strImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  },
  {
    id: 3,
    strName: "Mechanical Keyboard Mat",
    strCategory: "Accessories",
    strDescription: "Extra large desk mat with syntax highlight design.",
    numPrice: 30.00,
    strImageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  },
  {
    id: 4,
    strName: "Coffee to Code Mug",
    strCategory: "Accessories",
    strDescription: "Matte black ceramic mug. Essential for turning caffeine into logic.",
    numPrice: 15.00,
    strImageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  },
  {
    id: 5,
    strName: "Syntax Error Sweatpants",
    strCategory: "Comfort Wear",
    strDescription: "Ultimate comfort for debugging from the couch.",
    numPrice: 35.00,
    strImageUrl: "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  },
  {
    id: 6,
    strName: "It Works on My Machine Sticker Pack",
    strCategory: "Memes",
    strDescription: "High quality vinyl stickers for your laptop.",
    numPrice: 10.00,
    strImageUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=600",
    boolInStock: true
  }
];

export const fetchProductList = async () => {
  try {
    const data = await apiClient.get('/product/');
    if (!data || data.length === 0) return dummyProducts;
    return data;
  } catch (error) {
    return dummyProducts;
  }
};

