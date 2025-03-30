import { useState } from 'react';
import authService, { LoginRequest } from '../../services/auth.service';
import axios from 'axios';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>('testuser');
  const [password, setPassword] = useState<string>('password123');
  const [directUrl, setDirectUrl] = useState<string>('http://localhost:8080/api/auth/signin');

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      // Test login credentials
      const credentials: LoginRequest = {
        username,
        password
      };
      
      console.log('Attempting login with service:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Extract detailed error information
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      const status = err.response?.status;
      const headers = err.response?.headers;
      
      console.log('Full error object:', err);
      if (err.response) {
        console.log('Response data:', err.response.data);
        console.log('Response status:', err.response.status);
        console.log('Response headers:', err.response.headers);
      }
      

      
      setError(`Error (${status}): ${errorMessage}\n\nHeaders: ${JSON.stringify(headers, null, 2)}\n\nFull error: ${JSON.stringify(err, null, 2)}`);
      
      if (err.response && err.response.data) {
        console.log('Error data structure:', Object.keys(err.response.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      console.log(`Direct fetch to ${directUrl}`);
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit', // Don't send cookies with the request
        body: JSON.stringify({
          username,
          password
        })
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', response.headers);
      
      const data = await response.text();
      console.log('Raw response:', data);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', jsonData);
        setResult(JSON.stringify(jsonData, null, 2));
      } catch (jsonError) {
        console.log('Response is not JSON:', data);
        setResult(data);
      }
    } catch (err: any) {
      console.error('Direct fetch error:', err);
      setError(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testDirectAxios = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      console.log(`Direct axios to ${directUrl}`);
      const response = await axios.post(directUrl, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false // Don't send cookies with the request
      });
      
      console.log('Axios response:', response);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      console.error('Direct axios error:', err);
      setError(`Axios Error: ${err.message}\n\nResponse: ${JSON.stringify(err.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Testing</h1>
      
      <div className="mb-4">
        <div className="flex flex-col gap-2 mb-4">
          <label className="font-bold">Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        
        <div className="flex flex-col gap-2 mb-4">
          <label className="font-bold">Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        
        <div className="flex flex-col gap-2 mb-4">
          <label className="font-bold">Direct URL:</label>
          <input 
            type="text" 
            value={directUrl} 
            onChange={(e) => setDirectUrl(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={testLogin}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Auth Service'}
        </button>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          onClick={testDirectFetch}
          disabled={loading}
        >
          Test Direct Fetch
        </button>
        
        <button 
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          onClick={testDirectAxios}
          disabled={loading}
        >
          Test Direct Axios
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold mb-2">Error:</h3>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Success Response:</h3>
          <pre className="p-4 bg-green-100 border border-green-400 text-green-700 rounded whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
