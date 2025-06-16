import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated: newAuth, user: newUser } = useSelector((state) => state.userAuth);
  const { isAuthenticated: oldAuth, user: oldUser } = useSelector((state) => state.auth);

  // Use either auth system, preferring the new one
  const isAuthenticated = newAuth || oldAuth;
  const user = newUser || oldUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;