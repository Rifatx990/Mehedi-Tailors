import api from './api';

const productService = {
  // Get all products with filters
  getProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },

  // Get single product
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/products/categories/all');
    return response.data;
  },

  // Admin: Create product
  createProduct: async (productData) => {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key === 'images' && Array.isArray(productData.images)) {
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (Array.isArray(productData[key])) {
        productData[key].forEach(item => {
          formData.append(`${key}[]`, item);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Admin: Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
