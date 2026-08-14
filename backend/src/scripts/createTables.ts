import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log("🚀 Starting migration...");
    
    await client.query("BEGIN");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created");

    // Create categories table with proper columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Categories table created");

    // Add missing columns to categories if they don't exist
    try {
      await client.query(`
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
        ADD COLUMN IF NOT EXISTS color VARCHAR(20);
      `);
      console.log("✅ Added missing columns to categories");
    } catch (error) {
      console.log("ℹ️ Columns already exist or couldn't be added");
    }

    // Create payment_methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Payment methods table created");

    // Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
        expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Expenses table created");

    // Create expense_audit table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expense_audit (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Audit table created");

    // DROP existing view if it exists
    await client.query(`
      DROP VIEW IF EXISTS expense_report CASCADE;
    `);
    console.log("✅ Dropped existing expense_report view");

    // Create expense_report view
    await client.query(`
      CREATE VIEW expense_report AS
      SELECT 
        e.id,
        e.title,
        e.description,
        e.amount,
        e.expense_date,
        u.name AS user_name,
        c.name AS category_name,
        pm.name AS payment_method_name,
        e.created_at
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id;
    `);
    console.log("✅ Expense report view created");

    // Insert default payment methods
    await client.query(`
      INSERT INTO payment_methods (name) VALUES
        ('Cash'),
        ('Credit Card'),
        ('Debit Card'),
        ('UPI'),
        ('Bank Transfer')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Default payment methods inserted");

    // Insert default categories (only if they don't exist)
    await client.query(`
      INSERT INTO categories (name) VALUES
        ('Food'),
        ('Transport'),
        ('Shopping'),
        ('Entertainment'),
        ('Bills'),
        ('Healthcare'),
        ('Education'),
        ('Other')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Default categories inserted");

    // Update categories with icons and colors if columns exist
    await client.query(`
      UPDATE categories SET 
        icon = CASE name
          WHEN 'Food' THEN '🍔'
          WHEN 'Transport' THEN '🚗'
          WHEN 'Shopping' THEN '🛍️'
          WHEN 'Entertainment' THEN '🎬'
          WHEN 'Bills' THEN '📄'
          WHEN 'Healthcare' THEN '🏥'
          WHEN 'Education' THEN '📚'
          WHEN 'Other' THEN '📌'
        END,
        color = CASE name
          WHEN 'Food' THEN '#FF6B6B'
          WHEN 'Transport' THEN '#4ECDC4'
          WHEN 'Shopping' THEN '#45B7D1'
          WHEN 'Entertainment' THEN '#96CEB4'
          WHEN 'Bills' THEN '#FFEAA7'
          WHEN 'Healthcare' THEN '#DDA0DD'
          WHEN 'Education' THEN '#98D8C8'
          WHEN 'Other' THEN '#A8A8A8'
        END
      WHERE name IN ('Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other')
      AND icon IS NULL;
    `);
    console.log("✅ Updated categories with icons and colors");

    // Insert default user
    await client.query(`
      INSERT INTO users (name, email) VALUES
        ('John Doe', 'john@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log("✅ Default user inserted");

    await client.query("COMMIT");
    console.log("🎉 Migration completed successfully!");
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
createTables()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });