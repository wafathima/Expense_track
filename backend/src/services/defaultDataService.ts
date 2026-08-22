// defaultDataService.ts
import pool from "../config/db";

export async function createDefaultCategories(userId: number) {
  const defaultCategories = [
    { name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
    { name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
    { name: 'Bills', icon: '📄', color: '#FFEAA7' },
    { name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
    { name: 'Education', icon: '📚', color: '#98D8C8' },
    { name: 'Other', icon: '📌', color: '#A8A8A8' }
  ];

  for (const category of defaultCategories) {
    await pool.query(
      `INSERT INTO categories (user_id, name, icon, color)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [userId, category.name, category.icon, category.color]
    );
  }
}

export async function createDefaultPaymentMethods(userId: number) {
  const defaultMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'];

  for (const method of defaultMethods) {
    await pool.query(
      `INSERT INTO payment_methods (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [userId, method]
    );
  }
}