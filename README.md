# Expense Tracker Application

A full-stack expense management application built with Next.js, Express.js, TypeScript, and PostgreSQL.

##  Features

### Frontend
- Next.js with App Router
- TypeScript
- Responsive UI with Tailwind CSS
- CRUD Operations (Create, Read, Update, Delete)
- Search & Filter Expenses
- Interactive Charts & Visualizations
- Real-time Analytics

### Backend
- Express.js REST API
- TypeScript
- PostgreSQL Database
- Validation with Zod
- Error Handling
- Connection Pooling
- Parameterized Queries

## Database Schema (ER Diagram)

[ER Diagram](https://dbdiagram.io/d/6a7fecc5c6a866c907715266)

### Tables Overview

| Table | Description |
|-------|-------------|
| **users** | User accounts |
| **categories** | Expense categories (Food, Transport, etc.) |
| **payment_methods** | Payment methods (Cash, Credit Card, etc.) |
| **expenses** | Main expense records |
| **expense_audit** | Audit trail for expenses |

### Relationships
- **users** → **expenses**: One user can have many expenses (1:N)
- **categories** → **expenses**: One category can have many expenses (1:N)
- **payment_methods** → **expenses**: One payment method can have many expenses (1:N)
- **expenses** → **expense_audit**: One expense can have many audit records (1:N)

### Schema Details

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table
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

-- Audit Table
CREATE TABLE expense_audit (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



