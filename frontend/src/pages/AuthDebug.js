import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { clearAllAuthData, getBestToken } from '../utils/authUtils';

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    const info = {
      tokens: {
        token: localStorage.getItem('token'),
        userToken: localStorage.getItem('userToken'),
        doctorToken: localStorage.getItem('doctorToken'),
        persistentToken: localStorage.getItem('persistentToken'),
        reduxToken: localStorage.getItem('reduxToken')
      },
      userData: {
        user: localStorage.getItem('user'),
        userData: localStorage.getItem('userData'),
        currentUser: localStorage.getItem('currentUser')
      },
      authFlags: {
        auth_error: localStorage.getItem('auth_error'),
        auth_error_time: localStorage.getItem('auth_error_time')
      },
      bestToken: getBestToken(),
      axiosDefaultAuth: axios.defaults.headers.common['Authorization']
    };
    setDebugInfo(info);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test basic API connection
      console.log('Testing basic API connection...');
      const testResponse = await axios.get('/api/test');
      results.basicConnection = {
        success: true,
        data: testResponse.data,
        status: testResponse.status
      };
    } catch (error) {
      results.basicConnection = {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }

    try {
      // Test auth endpoint without token
      console.log('Testing auth endpoint without token...');
      const authResponse = await axios.get('/api/auth/test');
      results.authEndpoint = {
        success: true,
        data: authResponse.data,
        status: authResponse.status
      };
    } catch (error) {
      results.authEndpoint = {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }

    try {
      // Test protected endpoint with current token
      console.log('Testing protected endpoint with current token...');
      const token = getBestToken();
      if (token) {
        const protectedResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        results.protectedEndpoint = {
          success: true,
          data: protectedResponse.data,
          status: protectedResponse.status
        };
      } else {
        results.protectedEndpoint = {
          success: false,
          error: 'No token available'
        };
      }
    } catch (error) {
      results.protectedEndpoint = {
        success: false,
        error: error.message,
        status: error.response?.status,
        details: error.response?.data
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearAllData = () => {
    clearAllAuthData();
    
    // Also clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Reload debug info
    loadDebugInfo();
    
    alert('All authentication data cleared! You can now try logging in again.');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Authentication Debug Page</h1>
      <p>This page helps diagnose and fix authentication issues.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <button 
          onClick={testBackendConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>

        <button 
          onClick={clearAllData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear All Auth Data
        </button>

        <button 
          onClick={loadDebugInfo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Refresh Debug Info
        </button>

        <button 
          onClick={goToLogin}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Debug Info */}
        <div>
          <h2>Current Authentication State</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
            <h3>Tokens:</h3>
            <pre>{JSON.stringify(debugInfo.tokens, null, 2)}</pre>
            
            <h3>User Data:</h3>
            <pre>{JSON.stringify(debugInfo.userData, null, 2)}</pre>
            
            <h3>Auth Flags:</h3>
            <pre>{JSON.stringify(debugInfo.authFlags, null, 2)}</pre>
            
            <h3>Best Token:</h3>
            <pre>{debugInfo.bestToken ? `${debugInfo.bestToken.substring(0, 20)}...` : 'None'}</pre>
            
            <h3>Axios Default Auth:</h3>
            <pre>{debugInfo.axiosDefaultAuth || 'None'}</pre>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <h2>Connection Test Results</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
            {Object.keys(testResults).length === 0 ? (
              <p>Click "Test Backend Connection" to run tests</p>
            ) : (
              Object.entries(testResults).map(([test, result]) => (
                <div key={test} style={{ marginBottom: '15px' }}>
                  <h4 style={{ 
                    color: result.success ? '#28a745' : '#dc3545',
                    margin: '0 0 5px 0'
                  }}>
                    {test}: {result.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </h4>
                  <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h3>Common Solutions:</h3>
        <ul>
          <li><strong>Invalid signature errors:</strong> Clear all auth data and login again</li>
          <li><strong>Token expired:</strong> The system should auto-refresh, but you can clear data if needed</li>
          <li><strong>No token errors:</strong> Make sure you're logged in</li>
          <li><strong>Backend connection issues:</strong> Check if the backend server is running on port 5000</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebug;
