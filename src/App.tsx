import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, JSX } from 'react';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import TestAuth from './components/auth/TestAuth';
import NetworkDebug from './components/debug/NetworkDebug';
import authService from './services/auth.service';

// Lazy-loaded components
const Transactions = lazy(() => import('./components/transactions/TransactionList'));
const TransactionForm = lazy(() => import('./components/transactions/TransactionForm'));
const Categories = lazy(() => import('./components/categories/CategoryList'));
const CategoryForm = lazy(() => import('./components/categories/CategoryForm'));

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex justify-center items-center h-64">
    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="/network-debug" element={<NetworkDebug />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/add" 
              element={
                <ProtectedRoute>
                  <TransactionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/edit/:id" 
              element={
                <ProtectedRoute>
                  <TransactionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories/add" 
              element={
                <ProtectedRoute>
                  <CategoryForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories/edit/:id" 
              element={
                <ProtectedRoute>
                  <CategoryForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
