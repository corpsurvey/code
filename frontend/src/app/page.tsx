'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to logout?</p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">SurveyApp</Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/admin" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="text-gray-700 hover:text-indigo-600 cursor-pointer"
                  >
                    Welcome, {user.username}!
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                  <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Create and Share</span>
              <span className="block text-indigo-600">Surveys with Ease</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Design professional surveys, collect responses, and analyze results - all in one place.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for surveys
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow">
                <div className="p-3 rounded-md bg-indigo-50">
                  <Image src="/window.svg" alt="Easy to Use" width={24} height={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Easy to Use</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Create surveys in minutes with our intuitive interface.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow">
                <div className="p-3 rounded-md bg-indigo-50">
                  <Image src="/globe.svg" alt="Share Anywhere" width={24} height={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Share Anywhere</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Share your surveys with anyone, anywhere in the world.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow">
                <div className="p-3 rounded-md bg-indigo-50">
                  <Image src="/file.svg" alt="Real-time Results" width={24} height={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Results</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Get instant insights with real-time response analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Create your first survey today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of users who are already creating and sharing surveys.
          </p>
          <Link href="/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}
