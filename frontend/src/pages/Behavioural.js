import React from 'react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Behavioral = () => {
  return (
    <Layout>
      <div className="p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-[#06070b] rounded-lg max-w-5xl mx-auto shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8 flex items-center justify-center">
          <PlayCircle size={28} className="mr-2 sm:mr-3 text-purple-500 dark:text-purple-300" />
          How to Answer Behavioral Questions
        </h1>

        {/* Question 1 - Using STAR Method */}
        <div className="bg-white dark:bg-[#0e1821] p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6 transition-all duration-300">
          <div className="flex items-center text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            <CheckCircle size={20} className="mr-2 sm:mr-3 text-purple-500 dark:text-purple-300" />
            Question 1: Tell me about a time when you faced a challenge.
          </div>
          <hr className="my-3 sm:my-4 border-gray-300 dark:border-gray-600" />
          <div>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Situation:</span> 
              <span className="text-gray-700 dark:text-gray-200"> During my internship, I was tasked with redesigning a legacy system under tight deadlines.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Task:</span> 
              <span className="text-gray-700 dark:text-gray-200"> I had to gather user requirements, propose a new solution, and ensure seamless operation.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Action:</span> 
              <span className="text-gray-700 dark:text-gray-200"> I collaborated with the development team and introduced agile practices to manage tasks efficiently.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Result:</span> 
              <span className="text-gray-700 dark:text-gray-200"> The project was delivered on time, reducing downtime by 20% and improving system performance.</span>
            </p>
          </div>
        </div>

        {/* Question 2 - Using PAR Method */}
        <div className="bg-white dark:bg-[#0e1821] p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6 transition-all duration-300">
          <div className="flex items-center text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            <CheckCircle size={20} className="mr-2 sm:mr-3 text-purple-500 dark:text-purple-300" />
            Question 2: Give me an example of how you resolved a problem.
          </div>
          <hr className="my-3 sm:my-4 border-gray-300 dark:border-gray-600" />
          <div>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Problem:</span> 
              <span className="text-gray-700 dark:text-gray-200"> Our team was facing delays due to unclear communication about task dependencies.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Action:</span> 
              <span className="text-gray-700 dark:text-gray-200"> I introduced a clearer task assignment system with daily stand-ups to improve transparency.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Result:</span> 
              <span className="text-gray-700 dark:text-gray-200"> This led to a 25% increase in efficiency, and the project met its deadlines without further issues.</span>
            </p>
          </div>
        </div>

        {/* Question 3 - Using CAR Method */}
        <div className="bg-white dark:bg-[#0e1821] p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6 transition-all duration-300">
          <div className="flex items-center text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            <CheckCircle size={20} className="mr-2 sm:mr-3 text-purple-500 dark:text-purple-300" />
            Question 3: Describe a situation where you had to take initiative.
          </div>
          <hr className="my-3 sm:my-4 border-gray-300 dark:border-gray-600" />
          <div>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Challenge:</span> 
              <span className="text-gray-700 dark:text-gray-200"> We were falling behind on a project due to resource limitations.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Action:</span> 
              <span className="text-gray-700 dark:text-gray-200"> I created a revised schedule and personally took over some of the tasks to ensure the team stayed on track.</span>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-purple-600 dark:text-purple-400">Result:</span> 
              <span className="text-gray-700 dark:text-gray-200"> As a result, we caught up on the project timeline and successfully delivered to the client.</span>
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="block mt-6 sm:mt-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center py-2 sm:py-3 px-4 sm:px-6 rounded-md hover:opacity-90 transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Behavioral;
