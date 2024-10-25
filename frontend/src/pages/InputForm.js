import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from '../utils/api';
import { Upload, CheckCircle } from 'lucide-react';

const InputForm = () => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    company: '',
    role: '',
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Existing useEffect and handlers remain the same
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        userId: user.id,
        name: user.fullName || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
    }
  };

  const pollQuestionStatus = useCallback(async () => {
    try {
      const result = await authenticatedApi.checkQuestionStatus(formData.userId);
      if (result.success && result.questionsGenerated === 1) {
        setLoading(false);
        setSuccess(true);
      } else {
        setTimeout(() => pollQuestionStatus(), 5000);
      }
    } catch (error) {
      setError('Failed to check question status. Please try again.');
      setLoading(false);
    }
  }, [formData.userId, authenticatedApi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append('email', user.primaryEmailAddress?.emailAddress);
    if (resume) {
      formDataToSend.append('resume', resume, resume.name);
    }

    try {
      await authenticatedApi.submitUserInput(formDataToSend);
      pollQuestionStatus();
    } catch (error) {
      setError('An error occurred while submitting the form. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Processing your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Success!</h2>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Complete Your Profile</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resume
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-upload"
                required
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
              >
                <Upload className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {resume ? resume.name : 'Upload Resume'}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-all"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;