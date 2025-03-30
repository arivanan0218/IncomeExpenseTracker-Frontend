import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import transactionService, { Transaction, TransactionType } from '../../services/transaction.service';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let data: Transaction[];
        
        if (filter === 'ALL') {
          data = await transactionService.getAllTransactions();
        } else {
          data = await transactionService.getTransactionsByType(filter);
        }
        
        setTransactions(data);
        setError('');
      } catch (err: any) {
        setError('Failed to fetch transactions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        setTransactions(transactions.filter(transaction => transaction.id !== id));
      } catch (err: any) {
        setError('Failed to delete transaction. Please try again later.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Link
          to="/transactions/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Transaction
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ALL'
                ? 'bg-gray-800 text-white dark:bg-gray-700'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter(TransactionType.INCOME)}
            className={`px-4 py-2 rounded-md ${
              filter === TransactionType.INCOME
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter(TransactionType.EXPENSE)}
            className={`px-4 py-2 rounded-md ${
              filter === TransactionType.EXPENSE
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No transactions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {transaction.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={
                        transaction.type === TransactionType.INCOME
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === TransactionType.INCOME
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/transactions/edit/${transaction.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => transaction.id && handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
