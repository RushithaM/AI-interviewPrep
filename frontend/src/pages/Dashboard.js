import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Layout from '../components/Layout';
import { Clock, BarChart, AlertCircle, FileText, PlayCircle, Star, Building2, FileSearch, Contact } from 'lucide-react';
import { useAuthenticatedApi } from '../utils/api';

const Dashboard = () => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();

  const [questionCounts, setQuestionCounts] = useState({
    resume: 0,
    role: 0,
    company: 0,
  });
  const [timeSpent, setTimeSpent] = useState(0);
  const [areaToImprove, setAreaToImprove] = useState('');
  const [resumeScore, setResumeScore] = useState(0);

  useEffect(() => {
    localStorage.setItem('sessionStartTime', Date.now());
    const storedTimeSpent = parseInt(localStorage.getItem('totalTimeSpent'), 10) || 0;
    setTimeSpent(storedTimeSpent);

    setTimeout(() => {
      setAreaToImprove('Technical Skills');
    }, 1000);

    const updateQuestionCounts = () => {
      const storedResumeCount = parseInt(localStorage.getItem('resumeAnsweredCount'), 10) || 0;
      const storedRoleCount = parseInt(localStorage.getItem('roleAnsweredCount'), 10) || 0;
      const storedCompanyCount = parseInt(localStorage.getItem('companyAnsweredCount'), 10) || 0;
      setQuestionCounts({
        resume: storedResumeCount,
        role: storedRoleCount,
        company: storedCompanyCount,
      });
    };

    updateQuestionCounts();

    window.addEventListener('resumeAnsweredCountUpdated', updateQuestionCounts);
    window.addEventListener('roleAnsweredCountUpdated', updateQuestionCounts);
    window.addEventListener('companyAnsweredCountUpdated', updateQuestionCounts);

    const fetchResumeScore = async () => {
      try {
        const response = await authenticatedApi.getResumeAnalysis(user.id);
        if (response.success) {
          setResumeScore(response.analysis.score);
        }
      } catch (error) {
        console.error('Error fetching resume score:', error);
      }
    };

    fetchResumeScore();

    return () => {
      window.removeEventListener('resumeAnsweredCountUpdated', updateQuestionCounts);
      window.removeEventListener('roleAnsweredCountUpdated', updateQuestionCounts);
      window.removeEventListener('companyAnsweredCountUpdated', updateQuestionCounts);
    };
  }, [authenticatedApi, user.id]); // Added authenticatedApi and user.id to the dependency array

  const getProgressWidth = (count) => `${(count / 10) * 100}%`;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#06070b] dark:to-[#06070b] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Dashboard</h1>

          {/* Performance Analytics Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <Clock className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Time Spent</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{timeSpent} minutes</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <BarChart className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Resume Score</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{resumeScore}%</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <AlertCircle className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Areas to Improve</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{areaToImprove}</p>
              </div>
            </div>
          </div>

          {/* Question Tracker Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Question Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/resume-qa" className="card flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <div className="icon bg-blue-100 dark:bg-gray-700 p-3 rounded-full mb-4">
                  <FileSearch size={24} className="text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Resume Based Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Questions Answered: {questionCounts.resume}/10</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: getProgressWidth(questionCounts.resume) }}></div>
                </div>
              </Link>

              <Link to="/role-qa" className="card flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <div className="icon bg-green-100 dark:bg-gray-700 p-3 rounded-full mb-4">
                  <Contact size={24} className="text-green-500 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Role Based Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Questions Answered: {questionCounts.role}/10</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: getProgressWidth(questionCounts.role) }}></div>
                </div>
              </Link>

              <Link to="/company-qa" className="card flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <div className="icon bg-yellow-100 dark:bg-gray-700 p-3 rounded-full mb-4">
                  <Building2 size={24} className="text-yellow-500 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Company Based Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Questions Answered: {questionCounts.company}/10</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: getProgressWidth(questionCounts.company) }}></div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recommended Resources Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Recommended Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/tips" className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <FileText className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">10 Tips for Acing Your Interview</h3>
                <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl px-4 py-2 hover:opacity-90 transition-all">
                  View
                </button>
              </Link>

              <Link to="/behavioral" className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <PlayCircle className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">How to Answer Behavioral Questions</h3>
                <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl px-4 py-2 hover:opacity-90 transition-all">
                  View
                </button>
              </Link>

              <Link to="/star-method" className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all border-2 border-transparent hover:border-purple-500 hover:shadow-purple-500/50 hover:shadow-md">
                <Star className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Mastering the STAR Method</h3>
                <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl px-4 py-2 hover:opacity-90 transition-all">
                  View
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
