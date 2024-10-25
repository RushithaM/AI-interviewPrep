import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from '../utils/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const Quiz = () => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      if (user && user.id) {
        try {
          const response = await authenticatedApi.generateQuizQuestions(user.id);
          if (response.success && response.questions.length > 0) {
            setQuestions(response.questions.slice(0, 10)); // Limit to 10 questions
            setLoading(false);
          } else {
            setError('Failed to fetch quiz questions.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching quiz questions:', err);
          setError('An error occurred while fetching quiz questions.');
          setLoading(false);
        }
      }
    };

    fetchQuizQuestions();
  }, [user, authenticatedApi]);

  const handleAnswerSubmit = (optionKey) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionKey);
      setIsAnswerSubmitted(true);

      const currentQ = questions[currentQuestion];
      if (optionKey === currentQ.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const scorePercentage = questions.length > 0 ? (score / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <motion.div
          className="flex flex-col justify-center items-center h-screen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader className="animate-spin text-purple-500 dark:text-purple-300" size={64} />
          <p className="ml-4 text-xl font-semibold dark:text-white mt-4">Generating quiz questions... This may take a moment.</p>
        </motion.div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <motion.div
          className="max-w-4xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
        </motion.div>
      </Layout>
    );
  }

  if (showScore) {
    return (
      <Layout>
        <motion.div
          className="max-w-4xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Quiz Completed!</h2>
          <p className="text-xl text-center mb-6 text-gray-700 dark:text-gray-300">You scored {score} out of {questions.length}</p>
          <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scorePercentage}%` }}
              transition={{ duration: 1 }}
            ></motion.div>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Review Your Answers</h3>
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="p-6 rounded-lg shadow-md transition-all transform bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-800 dark:to-gray-700 hover:scale-105"
              >
                <p className="font-semibold text-lg text-white">Question {index + 1}: {q.question}</p>
                <p className="mt-2 text-green-300">Correct Answer: {q.correctAnswer}. {q.options[q.correctAnswer]}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        className="max-w-4xl mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Interview Preparation Quiz</h2>
        <div className="mb-6">
          <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scorePercentage}%` }}
              transition={{ duration: 1 }}
            ></motion.div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-700 dark:text-gray-300">Score: {score} / {questions.length}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Question {currentQuestion + 1} of {questions.length}</h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">{questions[currentQuestion].question}</p>

          <div className="grid grid-cols-1 gap-4">
            {Object.entries(questions[currentQuestion].options).map(([optionKey, optionValue]) => (
              <button
                key={optionKey}
                onClick={() => handleAnswerSubmit(optionKey)}
                disabled={isAnswerSubmitted}
                className={`py-2 px-4 rounded-lg text-left transition duration-200 border 
                  ${isAnswerSubmitted && optionKey === questions[currentQuestion].correctAnswer
                    ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-700/25 dark:border-green-400 dark:text-green-300'
                    : isAnswerSubmitted && optionKey === selectedOption
                    ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-700/25 dark:border-red-400 dark:text-red-300'
                    : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:dark:bg-gray-600'}`}
              >
                {optionKey}. {optionValue}
              </button>
            ))}
          </div>

          {isAnswerSubmitted && (
            <button
              onClick={handleNextQuestion}
              className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition duration-200"
            >
              Next Question
            </button>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Quiz;
