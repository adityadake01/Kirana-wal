import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function PendingApproval() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Under Review
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for registering as a seller with Kiranawala, <strong>{user?.displayName || 'Seller'}</strong>!
          </p>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Your seller account is currently waiting for admin approval. 
              We are verifying your details to ensure the quality of our marketplace. 
              This usually takes 24-48 hours.
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            You will receive a notification once your account is approved.
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => signOut()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Sign Out
            </button>
            
            <Link
              to="/"
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
