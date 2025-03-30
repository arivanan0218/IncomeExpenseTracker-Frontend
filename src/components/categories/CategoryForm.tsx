import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import categoryService, { Category } from '../../services/category.service';
import { TransactionType } from '../../services/transaction.service';

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .max(100, 'Name must not exceed 100 characters'),
    type: Yup.string()
      .required('Type is required')
      .oneOf(Object.values(TransactionType), 'Invalid category type'),
  });

  const formik = useFormik<Category>({
    initialValues: {
      name: '',
      type: TransactionType.EXPENSE,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        if (isEditing && id) {
          await categoryService.updateCategory(parseInt(id), values);
        } else {
          await categoryService.createCategory(values);
        }
        navigate('/categories');
      } catch (err: any) {
        const resMessage =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          err.toString();
        setError(resMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const data = await categoryService.getCategoryById(parseInt(id));
          
          formik.setValues({
            name: data.name,
            type: data.type,
          });
        } catch (err) {
          console.error('Failed to fetch category:', err);
          setError('Failed to fetch category details. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategory();
  }, [id, isEditing]);

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading category details...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Edit Category' : 'Add Category'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="card max-w-lg">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">Category Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              {...formik.getFieldProps('name')}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="form-error">{formik.errors.name}</div>
            ) : null}
          </div>
          
          <div className="mb-6">
            <label className="form-label">Category Type</label>
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={TransactionType.INCOME}
                  checked={formik.values.type === TransactionType.INCOME}
                  onChange={() => formik.setFieldValue('type', TransactionType.INCOME)}
                  className="form-radio h-5 w-5 text-green-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={TransactionType.EXPENSE}
                  checked={formik.values.type === TransactionType.EXPENSE}
                  onChange={() => formik.setFieldValue('type', TransactionType.EXPENSE)}
                  className="form-radio h-5 w-5 text-red-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
              </label>
            </div>
            {formik.touched.type && formik.errors.type ? (
              <div className="form-error">{formik.errors.type}</div>
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
                ? 'Update Category'
                : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/categories')}
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
