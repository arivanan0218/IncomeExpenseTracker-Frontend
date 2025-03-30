import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import transactionService, { TransactionSummary, MonthlyTransactionSummary } from '../../services/transaction.service';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState<MonthlyTransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found in localStorage');
          setError('Authentication token missing. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Token available, length:', token.length);
        console.log('Token starts with:', token.substring(0, 20) + '...');
        
        // First make a test fetch to verify authentication is working
        try {
          console.log('Making test fetch to verify token is valid...');
          const response = await fetch('http://localhost:8081/api/transactions/summary', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Test fetch response status:', response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Test fetch failed:', response.status, errorText);
            throw new Error(`API response error: ${response.status} ${errorText}`);
          }
        } catch (testError: any) {
          console.error('Token validation test failed:', testError);
        }
        
        const summaryData = await transactionService.getTransactionSummary();
        console.log('Summary data fetched successfully:', summaryData);
        
        const monthlyData = await transactionService.getMonthlyTransactions();
        console.log('Monthly data fetched successfully:', monthlyData);
        
        setSummary(summaryData);
        setMonthlyData(monthlyData);
      } catch (err: any) {
        const errorMessage = 
          err.response?.data?.message || 
          'Failed to load dashboard data. Please try again later.';
        
        console.error('Dashboard data fetch error:', err);
        console.error('Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message
        });
        
        setError(errorMessage);
        
        // If unauthorized, make sure to clear token and redirect
        if (err.response?.status === 401) {
          console.log('Unauthorized access to dashboard, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for bar chart
  const barChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(item => item.totalIncome),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Expense',
        data: monthlyData.map(item => item.totalExpense),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for doughnut chart
  const doughnutChartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [summary.totalIncome, summary.totalExpense],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50 dark:bg-green-900">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Income</h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${summary.totalIncome.toFixed(2)}
          </p>
        </div>
        
        <div className="card bg-red-50 dark:bg-red-900">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Expense</h2>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${summary.totalExpense.toFixed(2)}
          </p>
        </div>
        
        <div className="card bg-blue-50 dark:bg-blue-900">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Balance</h2>
          <p className={`text-2xl font-bold ${
            summary.balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Income vs Expense</h2>
          {monthlyData.length > 0 ? (
            <Bar data={barChartData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No monthly data available</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Distribution</h2>
          {summary.totalIncome > 0 || summary.totalExpense > 0 ? (
            <div className="h-64">
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
