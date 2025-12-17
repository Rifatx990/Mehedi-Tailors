import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : { items: [], total: 0, itemCount: 0 };
  } catch {
    return { items: [], total: 0, itemCount: 0 };
  }
};

const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size, color, fabric } = action.payload;
      const existingItem = state.items.find(
        item => 
          item.product.id === product.id && 
          item.size === size && 
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        toast.success('Quantity updated in cart');
      } else {
        state.items.push({
          product,
          quantity,
          size,
          color,
          fabric,
          price: product.discount_price || product.price
        });
        toast.success('Added to cart');
      }

      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      saveCartToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => 
        `${item.product.id}-${item.size}-${item.color}` === itemId
      );

      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          state.items = state.items.filter(i => 
            `${i.product.id}-${i.size}-${i.color}` !== itemId
          );
          toast.success('Item removed from cart');
        }

        state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
        state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        saveCartToStorage(state);
      }
    },

    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => 
        `${item.product.id}-${item.size}-${item.color}` !== itemId
      );
      
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      saveCartToStorage(state);
      toast.success('Item removed from cart');
    },

    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.total = 0;
      localStorage.removeItem('cart');
    }
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
