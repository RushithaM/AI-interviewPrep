import React, { useState } from 'react';
import { useAuthenticatedApi } from '../utils/api';
import { ChevronDown, ChevronUp, Loader } from 'lucide-react';

const QACard = ({ question, onAnswerGenerated }) => {
  const authenticatedApi = useAuthenticatedApi();
  const [answer, setAnswer] = useState(question.answer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(!!question.answer);

  const handleGenerateAnswer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedApi.generateAnswer(question.id);
      setAnswer(response.answer);
      setShowAnswer(true);
      if (onAnswerGenerated) {
        onAnswerGenerated();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate answer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswerVisibility = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg hover:border-purple-500 hover:shadow-purple-500/50 transform hover:scale-105 p-4 sm:p-6 mb-4">
      <div className="space-y-4">
        <p className="text-base sm:text-lg font-medium p-3 rounded-lg">
          {question.question}
        </p>

        {answer && (
          <div className="space-y-3">
            <button
              onClick={toggleAnswerVisibility}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              {showAnswer ? (
                <>
                  Hide Answer <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show Answer <ChevronDown size={16} />
                </>
              )}
            </button>

            {showAnswer && (
              <div
                className={`p-4 rounded-lg text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 
                  transition-colors duration-300 hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{answer}</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm p-2 rounded-lg bg-red-500/10 dark:bg-red-900/50 text-red-500 dark:text-red-300">
            {error}
          </p>
        )}

        {!answer && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleGenerateAnswer}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all duration-300 
                ${loading 
                  ? 'bg-gray-500 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
                }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                'Generate Answer'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QACard;
