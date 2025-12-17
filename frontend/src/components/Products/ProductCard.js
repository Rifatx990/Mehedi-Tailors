import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/outline';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      quantity: 1,
      size: product.size?.[0] || 'M',
      color: product.color?.[0] || 'Default'
    }));
  };

  const price = product.discount_price || product.price;
  const discount = product.discount_price ? 
    Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images?.[0] || '/images/placeholder.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
        >
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary-600">
              ৳{price.toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-sm text-gray-500 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <span className="text-xs text-green-600 font-medium">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-600 font-medium">
              Out of Stock
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center space-x-2">
          {product.size?.slice(0, 3).map((size) => (
            <span
              key={size}
              className="text-xs px-2 py-1 bg-gray-100 rounded"
            >
              {size}
            </span>
          ))}
          {product.size?.length > 3 && (
            <span className="text-xs text-gray-500">+{product.size.length - 3}</span>
          )}
        </div>

        <div className="mt-2 flex space-x-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 btn-secondary text-center py-2 text-sm"
          >
            <EyeIcon className="h-4 w-4 inline mr-1" />
            View
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
