import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createCustomOrder = createAsyncThunk(
  'orders/createCustomOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createCustomOrder(orderData);
      toast.success('Custom order placed successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place custom order');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (status, { rejectWithValue }) => {
    try {
      const response = await orderService.getUserOrders(status);
      return response;
    } catch (error) {
      toast.error('Failed to fetch orders');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (error) {
      toast.error('Order not found');
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createLoading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.error || 'Failed to create order';
      })
      
      // Create Custom Order
      .addCase(createCustomOrder.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCustomOrder.fulfilled, (state, action) => {
        state.createLoading = false;
      })
      .addCase(createCustomOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload?.error || 'Failed to create custom order';
      })
      
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch orders';
      })
      
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch order';
      });
  }
});

export const { clearOrder, clearOrders, clearError } = orderSlice.actions;
export default orderSlice.reducer;
