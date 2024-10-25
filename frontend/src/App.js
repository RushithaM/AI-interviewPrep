import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from './utils/api';
import LandingPage from './pages/LandingPage';
import InputForm from './pages/InputForm';
import Dashboard from './pages/Dashboard';
import ResumeQA from './pages/ResumeQA';
import CompanyQA from './pages/CompanyQA';
import RoleQA from './pages/RoleQA';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Tips from './pages/Tips';
import Behavioral from './pages/Behavioural';
import StarMethod from './pages/StarMethod';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Quiz from './pages/Quiz';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Loading...</h1>
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    </div>
  </div>
);

function App() {
  const { user, isLoaded } = useUser();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const authenticatedApi = useAuthenticatedApi();
  const [isDarkMode] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        console.log('Checking user profile...');
        try {
          const primaryEmail = user.primaryEmailAddress?.emailAddress;
          console.log('Primary email:', primaryEmail);
          const response = await authenticatedApi.checkUserProfile(user.id, primaryEmail);
          console.log('Profile check response:', response);
          if (response.success && !response.is_new_user) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    if (isLoaded) {
      console.log('User loaded, checking profile...');
      checkProfile();
    }
  }, [isLoaded, user, authenticatedApi]);


  if (!isLoaded || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className={isDarkMode ? 'min-h-screen bg-gray-900 text-gray-100' : 'min-h-screen bg-gray-50 text-gray-900'}>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route>
            <SignedIn>
              <Navbar />
              <Switch>
                {!hasProfile && (
                  <Route path="/input-form" component={InputForm} />
                )}
                {hasProfile && (
                  <>
                    <ProtectedRoute path="/input-form" component={Dashboard} />
                    <ProtectedRoute exact path="/dashboard" component={Dashboard} />
                    <ProtectedRoute path="/resume-qa" component={ResumeQA} />
                    <ProtectedRoute path="/company-qa" component={CompanyQA} />
                    <ProtectedRoute path="/role-qa" component={RoleQA} />
                    <ProtectedRoute path="/profile" component={Profile} />
                    <ProtectedRoute path="/tips" component={Tips} />
                    <ProtectedRoute path="/behavioral" component={Behavioral} />
                    <ProtectedRoute path="/star-method" component={StarMethod} />
                    <ProtectedRoute path="/resume-analysis" component={ResumeAnalysis} />
                    <ProtectedRoute path="/quiz" component={Quiz} />
                  </>
                )}
                <Route
                  render={() =>
                    hasProfile ? (
                      <Redirect to="/dashboard" />
                    ) : (
                      <Redirect to="/input-form" />
                    )
                  }
                />
              </Switch>
            </SignedIn>
            <SignedOut>
              <Redirect to="/" />
            </SignedOut>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;