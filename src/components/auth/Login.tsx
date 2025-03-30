import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage('');
      
      try {
        console.log('Attempting to login with:', { username: values.username });
        const response = await authService.login(values);
        console.log('Login response received:', response);
        
        // Verify token was received and stored
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          console.error('No token stored after login!');
          setMessage('Authentication failed: No token received');
          setLoading(false);
          return;
        }
        
        console.log('Token successfully stored, length:', storedToken.length);
        console.log('Login successful, navigating to dashboard');
        
        // Small delay to ensure localStorage is updated before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } catch (error: any) {
        console.error('Login error in component:', error);
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
          
        console.error('Setting error message:', resMessage);
        setMessage(resMessage);
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>
        
        <form onSubmit={formik.handleSubmit}>
          {message && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {message}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              {...formik.getFieldProps('username')}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="form-error">{formik.errors.username}</div>
            ) : null}
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="form-error">{formik.errors.password}</div>
            ) : null}
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
