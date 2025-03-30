import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService, { Category } from '../../services/category.service';
import { TransactionType } from '../../services/transaction.service';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let data: Category[];
        
        if (filter === 'ALL') {
          data = await categoryService.getAllCategories();
        } else {
          data = await categoryService.getCategoriesByType(filter);
        }
        
        setCategories(data);
        setError('');
      } catch (err: any) {
        setError('Failed to fetch categories. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? All transactions associated with this category will lose their category reference.')) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter(category => category.id !== id));
      } catch (err: any) {
        setError('Failed to delete category. It may have associated transactions.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Link
          to="/categories/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Category
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

      {categories.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 flex justify-between items-center"
              style={{
                borderLeftColor:
                  category.type === TransactionType.INCOME
                    ? '#10B981' // green-500
                    : '#EF4444', // red-500
              }}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p
                  className={`text-sm ${
                    category.type === TransactionType.INCOME
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {category.type}
                </p>
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/categories/edit/${category.id}`}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => category.id && handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
