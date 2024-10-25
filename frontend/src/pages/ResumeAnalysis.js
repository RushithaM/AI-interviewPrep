import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from '../utils/api';
import Layout from '../components/Layout';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ResumeAnalysis = () => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllImprovements, setShowAllImprovements] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (user && user.id) {
        try {
          let response = await authenticatedApi.getResumeAnalysis(user.id);
          if (response.status === 'pending') {
            const intervalId = setInterval(async () => {
              response = await authenticatedApi.getResumeAnalysis(user.id);
              if (response.status !== 'pending') {
                clearInterval(intervalId);
                if (response.success && response.analysis) {
                  setAnalysis(response.analysis);
                } else {
                  setError(response.error || 'Failed to fetch resume analysis.');
                }
                setLoading(false);
              }
            }, 5000);
          } else if (response.success && response.analysis) {
            setAnalysis(response.analysis);
            setLoading(false);
          } else {
            setError(response.error || 'Failed to fetch resume analysis.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching resume analysis:', err);
          setError('An error occurred while fetching the analysis.');
          setLoading(false);
        }
      }
    };

    fetchAnalysis();
  }, [user, authenticatedApi]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500 dark:border-purple-300"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-500 dark:text-red-300 text-center mt-10">{error}</p>
      </Layout>
    );
  }

  const toggleShowAllStrengths = () => setShowAllStrengths(!showAllStrengths);
  const toggleShowAllImprovements = () => setShowAllImprovements(!showAllImprovements);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-white to-gray-100 dark:from-[#0e1821] dark:to-[#1e293b] rounded-lg shadow-xl transition-colors duration-500">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Resume Analysis</h2>
        
        {analysis ? (
          <div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Resume Score</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full" style={{ width: `${analysis.score}%` }}></div>
              </div>
              <p className="mt-2 text-right text-gray-700 dark:text-gray-300 font-semibold">{analysis.score}%</p>
            </div>

            {/* Strengths Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Strengths</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {(showAllStrengths ? analysis.strengths : analysis.strengths.slice(0, 4)).map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-transparent border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:border-purple-500 dark:hover:border-purple-400 group"
                  >
                    <CheckCircle className="text-green-500 mr-3" size={20} />
                    <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-green-500 group-hover:font-bold">{strength}</span>
                  </div>
                ))}
              </div>
              {analysis.strengths.length > 4 && (
                <button
                  onClick={toggleShowAllStrengths}
                  className="mt-4 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-500 focus:outline-none font-semibold"
                >
                  {showAllStrengths ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>

            {/* Improvements Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Areas for Improvement</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {(showAllImprovements ? analysis.improvements : analysis.improvements.slice(0, 4)).map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-transparent border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:border-purple-500 dark:hover:border-purple-400 group"
                  >
                    <AlertCircle className="text-red-500 mr-3" size={20} />
                    <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-red-500 group-hover:font-bold">{area}</span>
                  </div>
                ))}
              </div>
              {analysis.improvements.length > 4 && (
                <button
                  onClick={toggleShowAllImprovements}
                  className="mt-4 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-500 focus:outline-none font-semibold"
                >
                  {showAllImprovements ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center dark:text-gray-200">No analysis data available.</p>
        )}
      </div>
    </Layout>
  );
};

export default ResumeAnalysis;
