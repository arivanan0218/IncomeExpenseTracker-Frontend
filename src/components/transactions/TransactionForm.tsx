import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import transactionService, { Transaction, TransactionType } from '../../services/transaction.service';
import categoryService, { Category } from '../../services/category.service';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  const validationSchema = Yup.object({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive'),
    description: Yup.string()
      .required('Description is required')
      .max(255, 'Description must not exceed 255 characters'),
    transactionDate: Yup.date()
      .required('Date is required')
      .max(new Date(), 'Date cannot be in the future'),
    categoryId: Yup.number()
      .required('Category is required'),
    type: Yup.string()
      .required('Type is required')
      .oneOf(Object.values(TransactionType), 'Invalid transaction type'),
  });

  const formik = useFormik<Transaction>({
    initialValues: {
      amount: 0,
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      categoryId: undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Submitting transaction form...', {
          isEditing,
          id,
          values
        });
        
        if (isEditing && id) {
          await transactionService.updateTransaction(parseInt(id), values);
          console.log('Transaction updated successfully');
        } else {
          // For new transactions, log the request in detail
          console.log('Creating new transaction with values:', JSON.stringify(values, null, 2));
          const result = await transactionService.createTransaction(values);
          console.log('Transaction created successfully:', result);
        }
        navigate('/transactions');
      } catch (err: any) {
        console.error('Transaction form submission error:', err);
        
        // More detailed error handling with debugging information
        let errorMessage = 'An error occurred while saving the transaction.';
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
          console.error('Error response data:', err.response.data);
          
          errorMessage = 
            (err.response.data && err.response.data.message) ||
            `Server error: ${err.response.status}` ||
            errorMessage;
          
          // Special handling for 401 errors
          if (err.response.status === 401) {
            errorMessage = 'Authentication error. Please login again.';
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Error request:', err.request);
          errorMessage = 'No response received from the server. Please check your connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log(`Fetching categories for transaction type: ${transactionType}`);
        const data = await categoryService.getCategoriesByType(transactionType);
        console.log(`Received ${data.length} categories:`, data);
        setCategories(data);
        
        // If we changed transaction type and the current category is not valid for this type
        if (formik.values.categoryId && 
            !data.some(category => category.id === formik.values.categoryId)) {
          console.log('Current category is not valid for this transaction type, resetting');
          formik.setFieldValue('categoryId', data.length > 0 ? data[0].id : undefined);
        }
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        
        // Check if it's an authentication error
        if (err.response && err.response.status === 401) {
          console.error('Authentication error when fetching categories');
          // Don't show this error in the UI as it will be handled by the interceptor
        } else {
          setError('Failed to load categories. Please try again later.');
        }
      }
    };

    fetchCategories();
  }, [transactionType]);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const data = await transactionService.getTransactionById(parseInt(id));
          setTransactionType(data.type);
          
          formik.setValues({
            amount: data.amount,
            description: data.description,
            transactionDate: new Date(data.transactionDate).toISOString().split('T')[0],
            type: data.type,
            categoryId: data.categoryId,
          });
        } catch (err) {
          console.error('Failed to fetch transaction:', err);
          setError('Failed to fetch transaction details. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransaction();
  }, [id, isEditing]);

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    formik.setFieldValue('type', type);
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading transaction details...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="card">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-6">
            <label className="form-label">Transaction Type</label>
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.INCOME)}
                className={`px-4 py-2 rounded-md ${
                  transactionType === TransactionType.INCOME
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                className={`px-4 py-2 rounded-md ${
                  transactionType === TransactionType.EXPENSE
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}
              >
                Expense
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              id="description"
              type="text"
              className="form-input"
              {...formik.getFieldProps('description')}
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="form-error">{formik.errors.description}</div>
            ) : null}
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="form-label">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              className="form-input"
              {...formik.getFieldProps('amount')}
            />
            {formik.touched.amount && formik.errors.amount ? (
              <div className="form-error">{formik.errors.amount}</div>
            ) : null}
          </div>
          
          <div className="mb-4">
            <label htmlFor="transactionDate" className="form-label">Date</label>
            <input
              id="transactionDate"
              type="date"
              className="form-input"
              {...formik.getFieldProps('transactionDate')}
            />
            {formik.touched.transactionDate && formik.errors.transactionDate ? (
              <div className="form-error">{formik.errors.transactionDate}</div>
            ) : null}
          </div>
          
          <div className="mb-6">
            <label htmlFor="categoryId" className="form-label">Category</label>
            <select
              id="categoryId"
              className="form-input"
              {...formik.getFieldProps('categoryId')}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formik.touched.categoryId && formik.errors.categoryId ? (
              <div className="form-error">{formik.errors.categoryId}</div>
            ) : null}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Transaction'
                : 'Create Transaction'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
