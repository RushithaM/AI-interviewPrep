# AI InterviewPrep

## Overview
This project is an AI-powered website designed to help users prepare for job interviews by generating customized interview questions based on resumes and job preferences. It offers features like resume-based, role-based, and company-specific interview questions.

## Features

- **Dashboard**: View a summary of your progress, including time spent, resume score, and areas to improve.
- **Resume Analysis**: Analyze your resume to get feedback and suggestions for improvement.
- **Question Tracker**: Keep track of your answers to various interview questions categorized into:
  - Resume Based Questions
  - Role Based Questions
  - Company Based Questions
- **Recommended Resources**: Access articles and tips for interview preparation.
- **User Authentication**: Secure user authentication using Clerk for a seamless login experience.

## Technologies

- **Frontend**: Built with React.js for a responsive user interface.
- **Backend**: Developed using Node.js with Express for handling API requests.
- **Database**: MySQL for storing user data and interview-related information.
- **Authentication**: Clerk for managing user authentication and authorization.

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- MySQL server
- Python 3.8 or above

### Environment Setup
Create a `.env` file in the backend and frontend directories

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/RushithaM/AI-interviewPrep.git
    cd AI-interviewPrep
2. Navigate to the backend directory:
    ```bash
    cd backend
3. Install dependencies:
    ```bash
    npm install
4. Set up your MySQL database:
    - Create a new database for the application.
    - Update your database configuration in the .env file.
5. Navigate to the frontend directory:
    ```bash
    cd ../frontend
6. Install frontend dependencies:
    ```bash
    npm install
7. Start the application:
   ```bash
   # Start the backend server
   cd backend
   npm start

   # In a new terminal, start the frontend server
   cd frontend
   npm start
