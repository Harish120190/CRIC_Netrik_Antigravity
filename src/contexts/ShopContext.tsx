import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'bats' | 'balls' | 'shoes' | 'jerseys' | 'accessories' | 'equipment';
  image: string;
  rating: number;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  // Checkout
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  placeOrder: () => Promise<string>; // Returns order ID
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('shop-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(() => {
    const savedAddress = localStorage.getItem('shop-address');
    return savedAddress ? JSON.parse(savedAddress) : null;
  });

  useEffect(() => {
    localStorage.setItem('shop-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (shippingAddress) {
      localStorage.setItem('shop-address', JSON.stringify(shippingAddress));
    }
  }, [shippingAddress]);


  const addToCart = (product: Product, size?: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.selectedSize === size);

      const sizeText = size ? ` (Size: ${size})` : '';

      if (existingItem) {
        toast.success(`Updated ${product.name}${sizeText} quantity in cart`);
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Added ${product.name}${sizeText} to cart`);
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId && item.selectedSize === size ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  const placeOrder = async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
        // In a real app, send data to backend here
        console.log("Order Placed:", { id: orderId, items: cart, total: cartTotal, shippingAddress });
        clearCart();
        resolve(orderId);
      }, 1500);
    });
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        shippingAddress,
        setShippingAddress,
        placeOrder
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
