import api from './api';
import { TransactionType } from './transaction.service';

export interface Category {
  id?: number;
  name: string;
  type: TransactionType;
}

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('Getting all categories');
      const response = await api.get('/api/categories');
      console.log('Got categories:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  async getCategoriesByType(type: TransactionType): Promise<Category[]> {
    try {
      console.log(`Getting categories by type: ${type}`);
      const response = await api.get(`/api/categories/type/${type}`);
      console.log(`Got categories for type ${type}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching categories by type ${type}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      console.log(`Getting category by id: ${id}`);
      const response = await api.get(`/api/categories/${id}`);
      console.log(`Got category ${id}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching category ${id}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      console.log('Creating new category:', category);
      const response = await api.post('/api/categories', category);
      console.log('Category created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      console.log(`Updating category ${id}:`, category);
      const response = await api.put(`/api/categories/${id}`, category);
      console.log(`Category ${id} updated:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating category ${id}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      console.log(`Deleting category ${id}`);
      await api.delete(`/api/categories/${id}`);
      console.log(`Category ${id} deleted successfully`);
    } catch (error: any) {
      console.error(`Error deleting category ${id}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }
}

export default new CategoryService();
