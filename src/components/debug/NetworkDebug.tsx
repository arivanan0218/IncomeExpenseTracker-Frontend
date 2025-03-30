import { useState } from 'react';
import api from '../../services/api';

/**
 * Debug component to make test requests and validate authentication
 */
export default function NetworkDebug() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth token
  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return "No token found in localStorage";
    }
    
    // Check token structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      return "Token has invalid format (should have 3 parts separated by dots)";
    }

    try {
      // Try to parse the payload
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp;
      
      if (expiry && expiry * 1000 < Date.now()) {
        return "Token has expired";
      }
      
      return `Valid token for user: ${payload.sub}, expires: ${new Date(expiry * 1000).toLocaleString()}`;
    } catch (e) {
      return "Could not parse token payload";
    }
  };

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    const testResults = [];

    // Check token
    testResults.push({ endpoint: "Token Check", result: checkToken() });
    
    try {
      // Test categories endpoint
      try {
        const categoriesResp = await api.get('/api/categories');
        testResults.push({ 
          endpoint: "GET /api/categories", 
          status: categoriesResp.status,
          success: true,
          data: categoriesResp.data.slice(0, 2) // Just show first two for brevity
        });
      } catch (err: any) {
        testResults.push({ 
          endpoint: "GET /api/categories", 
          status: err.response?.status,
          success: false,
          error: err.message
        });
      }
      
      // Test transactions endpoint
      try {
        const transactionsResp = await api.get('/api/transactions');
        testResults.push({ 
          endpoint: "GET /api/transactions", 
          status: transactionsResp.status,
          success: true,
          data: transactionsResp.data.slice(0, 2) // Just show first two for brevity
        });
      } catch (err: any) {
        testResults.push({ 
          endpoint: "GET /api/transactions", 
          status: err.response?.status,
          success: false,
          error: err.message
        });
      }
      
      // Test auth endpoint
      try {
        const authResp = await api.get('/api/auth/user-profile');
        testResults.push({ 
          endpoint: "GET /api/auth/user-profile", 
          status: authResp.status,
          success: true,
          data: authResp.data
        });
      } catch (err: any) {
        testResults.push({ 
          endpoint: "GET /api/auth/user-profile", 
          status: err.response?.status,
          success: false,
          error: err.message,
          notFound: err.response?.status === 404
        });
      }
      
      setResults(testResults);
    } catch (e: any) {
      setError(`Failed to complete tests: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Network Diagnostics</h2>
      
      <button 
        onClick={testEndpoints}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Network Endpoints'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-700 rounded">
              <thead className="bg-gray-100 dark:bg-gray-600">
                <tr>
                  <th className="py-2 px-4 text-left">Endpoint</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{result.endpoint}</td>
                    <td className="py-2 px-4">
                      {typeof result.status === 'number' ? (
                        <span className={result.status >= 200 && result.status < 300 ? 'text-green-500' : 'text-red-500'}>
                          {result.status}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="py-2 px-4">
                      {result.success ? (
                        <div>
                          <span className="text-green-500">Success</span>
                          <pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div>
                          <span className="text-red-500">{result.error}</span>
                          {result.notFound && (
                            <p className="text-yellow-500 text-sm mt-1">
                              Note: 404 for user-profile is expected if endpoint doesn't exist
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
