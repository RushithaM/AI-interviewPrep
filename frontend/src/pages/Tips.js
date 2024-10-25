import React from 'react';
import Layout from '../components/Layout';
import { Search, Edit3, Shirt, Clock, ThumbsUp, FileText, Smile, Ear, HelpCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const tipsData = [
  "Research the company thoroughly.",  
  "Practice common interview questions.",  
  "Dress appropriately for the interview.",  
  "Be punctual and arrive early.",  
  "Be confident but not arrogant.",  
  "Bring multiple copies of your resume.",  
  "Maintain good body language throughout the interview.",  
  "Listen actively and don’t interrupt the interviewer.",  
  "Ask thoughtful questions at the end of the interview.",  
  "Follow up with a thank-you email after the interview."  
];

const Tips = () => {
  const iconArray = [
    <Search size={25} />,      
    <Edit3 size={25} />,       
    <Shirt size={25} />,       
    <Clock size={25} />,       
    <ThumbsUp size={25} />,    
    <FileText size={25} />,    
    <Smile size={25} />,       
    <Ear size={25} />,         
    <HelpCircle size={25} />,  
    <Mail size={25} />         
  ];

  return (
    <Layout>
      <div className="p-8 flex justify-center bg-[#f3f4f6] dark:bg-[#06070b] min-h-screen">
        <div className="max-w-7xl w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200 text-center mb-8">Top 10 Tips for Acing Your Interview</h1>
          
          {/* Main Content Section */}
          <div className="bg-gray-100 dark:bg-gray-900 p-6 sm:p-8 rounded-xl shadow-lg">
            {/* Grid for Tips */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {tipsData.map((tip, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-500/50 flex flex-col items-center text-center group"
                >
                  <div className="mb-2 sm:mb-4 text-purple-500 dark:text-purple-300">
                    {iconArray[index]}
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 group-hover:text-purple-500 dark:group-hover:text-purple-300">
                    Tip {index + 1}
                  </h3>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300 group-hover:text-purple-500 dark:group-hover:text-purple-300">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Back to Dashboard button */}
            <Link
              to="/dashboard"
              className="block mt-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center py-2 sm:py-3 px-6 rounded-md mx-auto w-full sm:w-48 hover:opacity-90 transition-all duration-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tips;
