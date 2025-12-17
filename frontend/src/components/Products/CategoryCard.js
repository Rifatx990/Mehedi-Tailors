import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${category.name}`}
      className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={category.image_url || '/images/categories/default.jpg'}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{category.name}</h3>
          <p className="text-white/80 text-sm line-clamp-1">
            {category.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
