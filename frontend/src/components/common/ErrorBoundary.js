import React, { Component } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  handleRefresh = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Reload the page
    window.location.reload();
  }

  handleGoHome = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Navigate to the home page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #f0f0f0'
            }}
          >
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but an error occurred while rendering this component.
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleRefresh}
                startIcon={<RefreshIcon />}
                sx={{ mr: 2 }}
              >
                Refresh Page
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
            </Box>
            
            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Error Details:
                </Typography>
                
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    maxHeight: '200px', 
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#d32f2f'
                  }}
                >
                  <pre>{this.state.error?.toString()}</pre>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
