import React, { useEffect, useState } from 'react';
import { useAuthenticatedApi } from '../utils/api';
import { useUser } from '@clerk/clerk-react';
import QACard from '../components/QACard';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { List, CheckCircle, HelpCircle, Loader } from 'lucide-react';

const RoleQA = () => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (user && user.id) {
        try {
          const response = await authenticatedApi.getQuestions(user.id, 'role');
          if (response.success) {
            setQuestions(response.questions);
            const initialAnsweredCount = response.questions.filter(q => q.answer).length;
            setAnsweredCount(initialAnsweredCount);
            localStorage.setItem('roleAnsweredCount', initialAnsweredCount.toString());
          } else {
            setError(response.error || 'Failed to fetch questions.');
          }
        } catch (err) {
          console.error('Error fetching role questions:', err);
          setError('An error occurred while fetching questions.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [user, authenticatedApi]);

  const handleAnswerGenerated = () => {
    const newCount = answeredCount + 1;
    setAnsweredCount(newCount);
    localStorage.setItem('roleAnsweredCount', newCount.toString());
    window.dispatchEvent(new Event('roleAnsweredCountUpdated'));
  };

  const filteredQuestions = questions.filter((question) => {
    if (filter === 'answered') return question.answer;
    if (filter === 'unanswered') return !question.answer;
    return true;
  });

  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader className="animate-spin text-purple-500 dark:text-purple-300" size={64} />
        <p className="mt-4 text-lg sm:text-xl font-semibold dark:text-white">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400 text-center mt-10">{error}</p>;
  }

  return (
    <Layout>
      <motion.div
        className="max-w-4xl mx-auto mt-8 sm:mt-10 p-4 sm:p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white">Role Based Questions</h2>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          ></motion.div>
        </div>
        
        <p className="text-center mb-4 sm:mb-6 text-sm sm:text-md font-semibold text-gray-700 dark:text-white flex items-center justify-center">
          <CheckCircle className="text-green-500 dark:text-green-300 mr-2" size={20} />
          {answeredCount} of {questions.length} questions answered
        </p>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-6 sm:mb-8 space-x-2 sm:space-x-4">
          {['all', 'answered', 'unanswered'].map((type) => (
            <button
              key={type}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center ${
                filter === type
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
              }`}
              onClick={() => setFilter(type)}
            >
              {type === 'all' && <List className="mr-2" />}
              {type === 'answered' && <CheckCircle className="mr-2" />}
              {type === 'unanswered' && <HelpCircle className="mr-2" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}{' '}
              <span className="ml-1 sm:ml-2">
                {type === 'all' ? questions.length : type === 'answered' ? answeredCount : questions.length - answeredCount}
              </span>
            </button>
          ))}
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">No questions found.</p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredQuestions.map((question) => (
              <QACard
                key={question.id}
                question={question}
                onAnswerGenerated={handleAnswerGenerated}
              />
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default RoleQA;
