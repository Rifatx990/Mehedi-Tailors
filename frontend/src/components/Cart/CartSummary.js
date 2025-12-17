import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart } from '../../features/cart/cartSlice';
import { TrashIcon } from '@heroicons/react/outline';

const CartSummary = () => {
  const { items, total, itemCount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (itemCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <ShoppingCartIcon className="h-24 w-24 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 mb-6">
          Add some products to your cart
        </p>
        <Link to="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cart Summary</h2>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-red-600 hover:text-red-800 text-sm flex items-center"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center border-b pb-4">
            <img
              src={item.product.images?.[0] || '/images/placeholder.jpg'}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="ml-4 flex-1">
              <h4 className="font-medium text-gray-800">{item.product.name}</h4>
              <div className="text-sm text-gray-600 mt-1">
                <span className="mr-3">Size: {item.size}</span>
                <span className="mr-3">Color: {item.color}</span>
                {item.fabric && <span>Fabric: {item.fabric}</span>}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600 font-bold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    (৳{item.price.toLocaleString()} × {item.quantity})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">৳{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery</span>
            <span className="font-medium">৳100</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>৳{(total + 100).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full mt-6 btn-primary py-3 text-lg"
        >
          Proceed to Checkout ({itemCount} items)
        </button>

        <Link
          to="/shop"
          className="block w-full mt-3 btn-secondary text-center py-3"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
