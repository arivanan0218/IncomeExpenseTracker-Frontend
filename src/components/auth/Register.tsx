import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/auth.service';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Email is invalid'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setMessage('');
      setLoading(true);
      setSuccessful(false);
      
      try {
        const { username, email, password } = values;
        await authService.register({ username, email, password });
        setSuccessful(true);
        setMessage('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
          
        setMessage(resMessage);
        setSuccessful(false);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create a new account</p>
        </div>
        
        <form onSubmit={formik.handleSubmit}>
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                successful
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
          
          {!successful && (
            <>
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
              
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="form-error">{formik.errors.email}</div>
                ) : null}
              </div>
              
              <div className="mb-4">
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
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  {...formik.getFieldProps('confirmPassword')}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <div className="form-error">{formik.errors.confirmPassword}</div>
                ) : null}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </>
          )}
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
