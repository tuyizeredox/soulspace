import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../store/slices/userAuthSlice';
import { CircularProgress, Box, alpha, useTheme } from '@mui/material';

const PrivateRoute = ({ children, roles = [] }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isAuthenticated: oldAuth, user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const {
    isAuthenticated: newAuth,
    user: newUser,
    token: newToken,
    authCheckLoading,
    lastAuthCheck
  } = useSelector((state) => state.userAuth);

  // Use either the new or old auth state, preferring the new one
  const isAuthenticated = newAuth || oldAuth;
  const user = newUser || oldUser;
  const token = newToken || oldToken;
  const location = useLocation();

  // Log authentication state for debugging
  console.log('PrivateRoute: Auth state', {
    path: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    hasNewToken: !!newToken,
    hasOldToken: !!oldToken
  });
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Use a ref to track if we've already verified auth in this session
  const authVerified = useRef(false);

  // Track last verification time to prevent too frequent checks
  const lastVerificationTime = useRef(0);
  const VERIFICATION_COOLDOWN = 30000; // 30 seconds

  // Check authentication on mount and when token changes
  useEffect(() => {
    const verifyAuth = async () => {
      // If we already have authentication and user data, don't block the UI
      const shouldBlockUI = !isAuthenticated || !user;

      if (shouldBlockUI) {
        setLoading(true);
      }

      // Check if we need to verify auth based on cooldown and lastAuthCheck from Redux
      const now = Date.now();
      const timeSinceLastReduxCheck = lastAuthCheck ? now - lastAuthCheck : Infinity;
      const timeSinceLastLocalCheck = now - lastVerificationTime.current;

      // Use the more recent check time
      const timeSinceLastCheck = Math.min(timeSinceLastReduxCheck, timeSinceLastLocalCheck);

      // Only verify if:
      // 1. We haven't verified in this session, OR
      // 2. It's been longer than the cooldown period since the last check
      const shouldVerify = !authVerified.current || timeSinceLastCheck > VERIFICATION_COOLDOWN;

      console.log('PrivateRoute: Auth check needed?', shouldVerify,
        'Time since last check:', Math.round(timeSinceLastCheck/1000) + 's');

      // Always ensure we have a token in localStorage
      const localStorageToken = localStorage.getItem('token') ||
                               localStorage.getItem('userToken') ||
                               localStorage.getItem('doctorToken') ||
                               localStorage.getItem('persistentToken');

      // If we have a token in Redux but not in localStorage, save it
      if (token && !localStorageToken) {
        console.log('Saving token to localStorage');
        localStorage.setItem('token', token);
        localStorage.setItem('userToken', token);
        localStorage.setItem('doctorToken', token);
        localStorage.setItem('persistentToken', token);
      }

      // If we have a token in localStorage but not in Redux, use it
      if (!token && localStorageToken) {
        console.log('Using token from localStorage');
        // This will trigger a re-render with the token from localStorage
        if (newAuth) {
          dispatch({
            type: 'userAuth/setAuthState',
            payload: { token: localStorageToken }
          });
        } else {
          dispatch({
            type: 'auth/setToken',
            payload: localStorageToken
          });
        }
      }

      if ((token || localStorageToken) && shouldVerify && !authCheckLoading) {
        try {
          console.log('PrivateRoute: Verifying authentication');
          lastVerificationTime.current = now;

          // Prefer the new auth system
          if (newToken || (newAuth && localStorageToken)) {
            await dispatch(getCurrentUser()).unwrap();
            authVerified.current = true;
            console.log('Auth verification successful with new token');
          } else if (oldToken || (!newAuth && localStorageToken)) {
            await dispatch(checkAuthStatus()).unwrap();
            authVerified.current = true;
            console.log('Auth verification successful with old token');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Don't set authVerified to true if verification failed

          // If we have a network error but we already have user data,
          // consider auth verified to prevent constant re-verification attempts
          if (isAuthenticated && user) {
            console.log('Using cached authentication data due to network error');
            authVerified.current = true;
          } else if (localStorageToken) {
            // If we have a token in localStorage but verification failed,
            // try to use the cached user data
            const cachedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}');
            if (cachedUser && cachedUser.role) {
              console.log('Using cached user data from localStorage');
              if (newAuth) {
                dispatch({
                  type: 'userAuth/setAuthState',
                  payload: {
                    isAuthenticated: true,
                    user: cachedUser,
                    token: localStorageToken
                  }
                });
              } else {
                dispatch({
                  type: 'auth/setUser',
                  payload: cachedUser
                });
                dispatch({
                  type: 'auth/setToken',
                  payload: localStorageToken
                });
                dispatch({
                  type: 'auth/setAuthenticated',
                  payload: true
                });
              }
              authVerified.current = true;
            }
          }
        }
      } else if (token || localStorageToken) {
        // If we have a token but don't need to verify, consider auth verified
        authVerified.current = true;
      }

      setInitialCheckDone(true);
      setLoading(false);
    };

    verifyAuth();
  }, [dispatch, token, isAuthenticated, user, newToken, oldToken, lastAuthCheck, authCheckLoading, newAuth]);

  // Show loading state while checking authentication, but only on initial load
  // This prevents the loading spinner from showing on every re-render
  if (loading && !initialCheckDone) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`
            : `linear-gradient(135deg, ${alpha('#4f46e5', 0.9)} 0%, ${alpha('#2dd4bf', 0.9)} 100%)`,
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: 'white', mb: 3 }} />
        <Box
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontSize: '1.2rem'
          }}
        >
          Loading your dashboard...
        </Box>
      </Box>
    );
  }

  // If we're still loading but initial check is done, render children
  // This allows the dashboard to remain visible during background auth checks
  if (authCheckLoading && initialCheckDone && isAuthenticated) {
    // Continue showing the current page while checking auth in the background
    return children;
  }

  // If we have a valid user and token, but haven't completed the initial check yet,
  // render the children anyway to prevent unnecessary loading screens
  if (!initialCheckDone && isAuthenticated && user && token) {
    console.log('Rendering children while auth check completes in background');
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user?.role === 'super_admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Redirect super_admin from regular dashboard
  if (user?.role === 'super_admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect other users from admin dashboard
  if (user?.role !== 'super_admin' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
