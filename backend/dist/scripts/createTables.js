"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
async function createTables() {
    const client = await db_1.default.connect();
    try {
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
        // Create categories table
        await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        color VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Create payment_methods table
        await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
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
        // Create expense_audit table for transactions demo
        await client.query(`
      CREATE TABLE IF NOT EXISTS expense_audit (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Create view for expense report
        await client.query(`
      CREATE OR REPLACE VIEW expense_report AS
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
        // Insert default categories
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
        // Insert a default user if none exists
        await client.query(`
      INSERT INTO users (name, email) VALUES
        ('John Doe', 'john@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);
        await client.query("COMMIT");
        console.log("✅ Database tables created successfully");
        console.log("📝 Default data inserted");
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error creating tables:", error);
        throw error;
    }
    finally {
        client.release();
    }
}
// Run the migration
createTables()
    .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
})
    .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});
