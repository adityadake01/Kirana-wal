import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            Last Updated: <span className="font-medium text-emerald-600">{lastUpdated}</span>
          </p>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>
                When you use Kirana Wala, we may collect personal information that you provide to us directly, such as your name, email address, phone number, and delivery address. This information is necessary to process your orders and provide a seamless shopping experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Process and deliver your grocery orders.</li>
                <li>Communicate with you regarding your order status.</li>
                <li>Improve our platform and customer service.</li>
                <li>Ensure the security of your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing with Sellers</h2>
              <p>
                As a multi-vendor marketplace, we share necessary order details (like your name, delivery address, and contact number) with the specific local shop you ordered from so they can prepare and deliver your items. We do not sell your personal data to third-party marketers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Security</h2>
              <p>
                We implement strict security measures to protect your personal information. However, please remember that no method of transmission over the Internet is 100% secure.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
