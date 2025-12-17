import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomOrder } from '../features/orders/orderSlice';
import toast from 'react-hot-toast';
import {
  UserIcon,
  RulerIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhotographIcon
} from '@heroicons/react/outline';

const garmentTypes = [
  'Shirt',
  'Pant',
  'Suit',
  'Sherwani',
  'Panjabi',
  'Blazer',
  'Jacket',
  'Coat',
  'Kurta',
  'Saree Blouse',
  'Salwar Kameez'
];

const measurementFields = {
  Shirt: ['chest', 'waist', 'hips', 'shoulder', 'sleeve_length', 'shirt_length', 'neck'],
  Pant: ['waist', 'hips', 'inseam', 'outseam', 'thigh', 'knee', 'bottom'],
  Suit: ['chest', 'waist', 'hips', 'shoulder', 'sleeve_length', 'jacket_length', 'pant_waist', 'pant_length']
};

const CustomTailoringPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedGarment, setSelectedGarment] = useState('Shirt');
  const [measurements, setMeasurements] = useState({});
  const [designFiles, setDesignFiles] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDesignFiles(files);
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to place custom order');
      return;
    }

    const orderData = {
      garment_type: selectedGarment,
      measurements,
      notes: data.notes,
      delivery_date: data.delivery_date,
      fabric_preference: data.fabric_preference,
      design_description: data.design_description
    };

    try {
      await dispatch(createCustomOrder(orderData)).unwrap();
      toast.success('Custom order placed successfully!');
      // Reset form
      setMeasurements({});
      setDesignFiles([]);
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Custom Tailoring Service</h1>
          <p className="text-gray-600 mb-8">
            Please login to access our custom tailoring service
          </p>
          <a
            href="/login"
            className="btn-primary"
          >
            Login to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Custom Tailoring Order
          </h1>
          <p className="text-gray-600 text-lg">
            Get perfectly fitted clothes tailored just for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Steps */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-600 rounded-full mr-3">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p className="text-sm text-gray-600">{user?.name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Garment Type Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Garment Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {garmentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedGarment(type)}
                        className={`p-4 rounded-lg border text-center ${
                          selectedGarment === type
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Measurements */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <RulerIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold">Measurements (in inches)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {measurementFields[selectedGarment]?.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {field.replace('_', ' ')}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            step="0.5"
                            className="input-field"
                            placeholder="0.0"
                            value={measurements[field] || ''}
                            onChange={(e) => handleMeasurementChange(field, e.target.value)}
                          />
                          <span className="ml-2 text-gray-500">inches</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    * Don't know your measurements?{' '}
                    <a href="/measurement-guide" className="text-primary-600 hover:underline">
                      View measurement guide
                    </a>
                  </p>
                </div>

                {/* Fabric & Design */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold">Fabric & Design Details</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric Preference
                      </label>
                      <input
                        type="text"
                        {...register('fabric_preference')}
                        className="input-field"
                        placeholder="e.g., Cotton, Linen, Silk..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Design Description
                      </label>
                      <textarea
                        {...register('design_description')}
                        rows={3}
                        className="input-field"
                        placeholder="Describe your design preferences, style, color choices..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Design Images (Optional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <PhotographIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                              <span>Upload files</span>
                              <input
                                type="file"
                                className="sr-only"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                      {designFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {designFiles.length} file(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery & Notes */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold">Delivery & Additional Notes</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        {...register('delivery_date', { required: 'Delivery date is required' })}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.delivery_date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.delivery_date.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={2}
                        className="input-field"
                        placeholder="Any special requirements or notes for the tailor..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg"
                >
                  Place Custom Order
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary & Guide */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Garment Type:</span>
                  <span className="font-medium">{selectedGarment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Measurements:</span>
                  <span className="font-medium">
                    {Object.keys(measurements).length} entered
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Estimated Starting From:</span>
                    <span className="text-primary-600">৳1,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tailoring Guide */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4">Tailoring Process</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Place Order</p>
                    <p className="text-sm text-gray-600">Submit measurements and preferences</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Design Confirmation</p>
                    <p className="text-sm text-gray-600">Our tailor will contact you for final design</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Production</p>
                    <p className="text-sm text-gray-600">Expert tailoring with premium materials</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Delivery & Fitting</p>
                    <p className="text-sm text-gray-600">Home delivery with free alterations if needed</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Contact Support */}
            <div className="card p-6 bg-primary-50">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our tailoring experts are here to assist you
              </p>
              <a
                href="tel:+8801712345678"
                className="block text-center btn-primary py-2"
              >
                Call Tailor: +880 1712-345678
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTailoringPage;
