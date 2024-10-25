import React from 'react';
import QuestionItem from './QuestionItem';

function QuestionList({ questions }) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionItem key={index} question={question} />
      ))}
    </div>
  );
}

export default QuestionList;