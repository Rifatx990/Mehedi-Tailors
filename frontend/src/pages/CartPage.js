import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartSummary from '../components/Cart/CartSummary';
import { updateQuantity, removeFromCart } from '../features/cart/cartSlice';
import { TrashIcon } from '@heroicons/react/outline';

const CartPage = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CartSummary />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b bg-gray-50 rounded-t-lg">
                <div className="col-span-5 font-medium text-gray-700">Product</div>
                <div className="col-span-2 font-medium text-gray-700">Price</div>
                <div className="col-span-2 font-medium text-gray-700">Quantity</div>
                <div className="col-span-2 font-medium text-gray-700">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {items.map((item) => {
                  const itemId = `${item.product.id}-${item.size}-${item.color}`;
                  const itemTotal = item.price * item.quantity;
                  
                  return (
                    <div key={itemId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-5 flex items-center space-x-4">
                          <img
                            src={item.product.images?.[0] || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div>
                            <Link to={`/product/${item.product.id}`}>
                              <h3 className="font-medium text-gray-800 hover:text-primary-600">
                                {item.product.name}
                              </h3>
                            </Link>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="mr-3">Size: {item.size}</span>
                              <span className="mr-3">Color: {item.color}</span>
                              {item.fabric && <span>Fabric: {item.fabric}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2">
                          <span className="text-gray-700 font-medium">
                            ৳{item.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2">
                          <div className="flex items-center border rounded-lg w-32">
                            <button
                              onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value) || 1)}
                              className="w-12 text-center border-x py-2"
                            />
                            <button
                              onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="col-span-2">
                          <span className="font-bold text-gray-900">
                            ৳{itemTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
