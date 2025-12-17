import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.products);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (product.size && product.size.length > 0) {
        setSelectedSize(product.size[0]);
      }
      if (product.color && product.color.length > 0) {
        setSelectedColor(product.color[0]);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    dispatch(addToCart({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor,
      fabric: product.fabric?.[0]
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const price = product.discount_price || product.price;
  const discount = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <img
                src={product.images?.[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="card p-8">
              {/* Category & Brand */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-primary-600 font-medium">
                  {product.category_name}
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full ${
                      isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <HeartIcon className="h-6 w-6" />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-gray-600">
                    <ShareIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(4.8 • 124 reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-primary-600">
                    ৳{price.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ৳{product.price.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.size?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border rounded-lg font-medium ${
                        selectedSize === size
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              {product.color && product.color.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-3">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 border rounded-lg font-medium flex items-center ${
                          selectedColor === color
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fabric Selection */}
              {product.fabric && product.fabric.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-3">Available Fabrics</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.fabric.map((fabric) => (
                      <span
                        key={fabric}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {fabric}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-8">
                <p className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 
                    ? `✅ In Stock (${product.stock} available)`
                    : '❌ Out of Stock'
                  }
                </p>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-primary-700 text-white py-4 text-lg rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <TruckIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-gray-500">Across Bangladesh</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Quality Guarantee</p>
                    <p className="text-sm text-gray-500">Premium Materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
