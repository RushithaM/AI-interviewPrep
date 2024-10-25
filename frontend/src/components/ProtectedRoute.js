import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default ProtectedRoute;