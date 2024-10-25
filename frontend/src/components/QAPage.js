import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from '../utils/api';

const QAPage = ({ title, questionType }) => {
  const { user } = useUser();
  const authenticatedApi = useAuthenticatedApi();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const primaryEmail = user.primaryEmailAddress?.emailAddress;
        const response = await authenticatedApi.getQuestions(questionType, primaryEmail);
        if (response.success) {
          setQuestions(response.questions);
        } else {
          setError(response.error || 'Failed to fetch questions');
        }
      } catch (error) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, questionType, authenticatedApi]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <ul className="space-y-4">
        {questions.map((question, index) => (
          <li key={index} className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">{question.question}</h2>
            <p>{question.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QAPage;