import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600">404</div>
          <div className="text-6xl font-bold text-gray-300 mt-4">Page Not Found</div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! The page you're looking for doesn't exist.
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          The page may have been moved, deleted, or you may have entered an incorrect URL.
          Don't worry, let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Here are some helpful links instead:</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
              Shop Products
            </Link>
            <Link to="/custom-tailoring" className="text-primary-600 hover:text-primary-700 font-medium">
              Custom Tailoring
            </Link>
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
