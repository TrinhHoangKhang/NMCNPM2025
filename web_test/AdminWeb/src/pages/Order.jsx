import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const Order = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100 p-4">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <ShoppingCart className="h-24 w-24 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-lg text-gray-600 mb-8">
          Looks like you haven't added anything to your cart yet.
          Start shopping to find great deals!
        </p>
        <Link
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
};

export default Order;
