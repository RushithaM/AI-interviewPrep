import React, { useState } from 'react';

function QuestionItem({ question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
      <button
        onClick={toggleAnswer}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </button>
      {showAnswer && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{question.answer}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionItem;