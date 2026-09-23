import { useEffect, useState } from 'react';

export default function TermsConditions() {
  const [lastUpdated, setLastUpdated] = useState('');
  
  useEffect(() => {
    // Automatically sets to current date when updated
    setLastUpdated(new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            Last Updated: <span className="font-medium text-emerald-600">{lastUpdated}</span>
          </p>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Kirana Wala, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p>
                Kirana Wala is a multi-vendor platform that connects local grocery shops (sellers) with customers. We facilitate the ordering process but are not directly responsible for the fulfillment, quality, or delivery of the groceries, which are handled by the respective local shops.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Pricing and Availability</h2>
              <p>
                All prices and availability of products are subject to change without notice by the respective sellers. We strive to ensure accurate pricing, but errors may occur.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
