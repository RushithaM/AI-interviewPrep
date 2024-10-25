import React, { useState, useEffect, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    userId: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUserProfile = useCallback(async () => {
    try {
      setFormData({
        userId: user.id,
        username: user.username || '',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      fetchUserProfile();
    } else if (!isSignedIn) {
      setError('You must be signed in to view this page.');
    }
  }, [userLoaded, isSignedIn, fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: formData.userId,
          username: formData.username,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-[#06070b] overflow-y-auto flex flex-col items-center">
        <h1 className="text-2xl md:text-4xl font-semibold mb-8 text-center text-gray-800 dark:text-white">
          Edit Profile
        </h1>

        <div className="flex justify-center mb-8">
          <div className="rounded-full shadow-lg p-1 bg-white dark:bg-[#0e1821]">
            <UserButton className="h-20 w-20" />
          </div>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        {success && <p className="text-green-500 dark:text-green-400 mb-4">{success}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#0e1821] shadow-lg rounded-xl px-6 md:px-12 py-8 w-full max-w-lg transition-all duration-300 border border-transparent hover:border-purple-500"
        >
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userId">
              User ID
            </label>
            <input
              className="shadow-inner appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e293b] leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="userId"
              type="text"
              name="userId"
              value={formData.userId}
              readOnly
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow-inner appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e293b] leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
            <Link
              to="/dashboard"
              className="text-purple-500 hover:text-purple-700 font-semibold text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </form>
      </main>
    </Layout>
  );
};

export default Profile;
