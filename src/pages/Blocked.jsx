import React from 'react';
import { useNavigate } from 'react-router-dom';

const Blocked = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Blocked</h1>
        <p className="text-gray-700 mb-6">Your account cannot sign in because your club has been blocked by the Super Admin. Please contact the administrator for assistance.</p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blocked;
