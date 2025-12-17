import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProductCard from '../components/Products/ProductCard';
import CategoryCard from '../components/Products/CategoryCard';
import { fetchProducts } from '../features/products/productSlice';
import { 
  ShoppingBagIcon, 
  ScissorsIcon, 
  TruckIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/outline';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 8 }));
    // Fetch categories
    // dispatch(fetchCategories());
  }, [dispatch]);

  const features = [
    {
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      title: 'Wide Selection',
      description: 'Choose from hundreds of ready-made outfits'
    },
    {
      icon: <ScissorsIcon className="h-8 w-8" />,
      title: 'Custom Tailoring',
      description: 'Perfect fit with our expert tailoring service'
    },
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Home delivery across the country'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Quality Guarantee',
      description: 'Premium fabrics and expert craftsmanship'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Tailoring & Ready-made Clothing
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Experience the perfect blend of traditional craftsmanship and modern fashion
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/shop"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/custom-tailoring"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Custom Tailoring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
            <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Tailoring CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Need Custom Tailoring?</h2>
                <p className="text-lg opacity-90 mb-6">
                  Get perfectly fitted clothes tailored just for you. Our expert tailors will 
                  ensure you get the perfect fit with premium fabrics.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                      <ScissorsIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Expert Tailors</div>
                      <div className="text-sm opacity-80">20+ years experience</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                      <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Perfect Fit Guarantee</div>
                      <div className="text-sm opacity-80">Free alterations</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Link
                  to="/custom-tailoring"
                  className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                >
                  Start Custom Order
                </Link>
                <p className="text-sm opacity-80 mt-3">
                  Get measurement guide & consultation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
