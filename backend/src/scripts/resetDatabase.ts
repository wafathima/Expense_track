// backend/src/scripts/resetDatabase.ts
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log("🔄 Resetting database...");
    
    await client.query("BEGIN");

    // Drop all tables in correct order
    console.log("🗑️ Dropping existing tables...");
    await client.query(`
      DROP TABLE IF EXISTS expense_audit CASCADE;
      DROP TABLE IF EXISTS expenses CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS payment_methods CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP VIEW IF EXISTS expense_report CASCADE;
    `);
    console.log("✅ All tables dropped");

    // ============================================
    // Create USERS table
    // ============================================
    console.log("📋 Creating users table...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created");

    // ============================================
    // Create CATEGORIES table
    // ============================================
    console.log("📋 Creating categories table...");
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Categories table created");

    // ============================================
    // Create PAYMENT METHODS table
    // ============================================
    console.log("📋 Creating payment methods table...");
    await client.query(`
      CREATE TABLE payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Payment methods table created");

    // ============================================
    // Create EXPENSES table
    // ============================================
    console.log("📋 Creating expenses table...");
    await client.query(`
      CREATE TABLE expenses (
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

    // ============================================
    // Create EXPENSE AUDIT table
    // ============================================
    console.log("📋 Creating expense audit table...");
    await client.query(`
      CREATE TABLE expense_audit (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Audit table created");

    // ============================================
    // Create EXPENSE REPORT view
    // ============================================
    console.log("📋 Creating expense report view...");
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

    // ============================================
    // Insert Default Data
    // ============================================
    console.log("📦 Inserting default data...");

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

    // Insert default categories with icons and colors
    await client.query(`
      INSERT INTO categories (name, icon, color) VALUES
        ('Food', '🍔', '#FF6B6B'),
        ('Transport', '🚗', '#4ECDC4'),
        ('Shopping', '🛍️', '#45B7D1'),
        ('Entertainment', '🎬', '#96CEB4'),
        ('Bills', '📄', '#FFEAA7'),
        ('Healthcare', '🏥', '#DDA0DD'),
        ('Education', '📚', '#98D8C8'),
        ('Other', '📌', '#A8A8A8')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Default categories inserted");

    // Create default user with password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash) 
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `, ['John Doe', 'john@example.com', hashedPassword]);
    console.log("✅ Default user created (john@example.com / password123)");

    await client.query("COMMIT");
    console.log("🎉 Database reset completed successfully!");
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database reset failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run reset
resetDatabase()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  });