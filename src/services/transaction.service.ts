import api from './api';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  transactionDate: string;
  type: TransactionType;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    type: TransactionType;
  };
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyTransactionSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
}

class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('Fetching all transactions...');
      const response = await api.get('/api/transactions');
      console.log('getAllTransactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    try {
      console.log(`Fetching transactions by type: ${type}...`);
      const response = await api.get(`/api/transactions/type/${type}`);
      console.log(`getTransactionsByType(${type}) response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions by type ${type}:`, error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await api.get(`/api/transactions/${id}`);
    console.log(`getTransactionById(${id}) response:`, response.data);
    return response.data;
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      console.log('Creating transaction:', transaction);
      // Ensure we're using the correct URL format with proper slash
      const response = await api.post('/api/transactions', transaction);
      console.log('createTransaction response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      // Log detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request made but no response received');
        console.error('Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  }

  async updateTransaction(id: number, transaction: Transaction): Promise<Transaction> {
    try {
      console.log(`Updating transaction ${id}:`, transaction);
      const response = await api.put(`/api/transactions/${id}`, transaction);
      console.log(`updateTransaction(${id}) response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log(`Deleting transaction ${id}...`);
      await api.delete(`/api/transactions/${id}`);
      console.log(`deleteTransaction(${id}) completed`);
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw error;
    }
  }

  async getTransactionSummary(): Promise<TransactionSummary> {
    console.log('Fetching transaction summary...');
    const response = await api.get('/api/transactions/summary');
    console.log('getTransactionSummary response:', response.data);
    return response.data;
  }

  async getMonthlyTransactions(): Promise<MonthlyTransactionSummary[]> {
    console.log('Fetching monthly transactions...');
    const response = await api.get('/api/transactions/monthly-summary');
    console.log('getMonthlyTransactions response:', response.data);
    return response.data;
  }
}

export default new TransactionService();
