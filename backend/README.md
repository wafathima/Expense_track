# Expense Tracker API

## Database Schema (ER Diagram)

### Tables
- **users**: Stores user information
- **categories**: Expense categories (Food, Transport, etc.)
- **payment_methods**: Payment methods (Cash, Credit Card, etc.)
- **expenses**: Main expense records
- **expense_audit**: Audit trail for expenses

### Relationships
- users → expenses: One-to-Many (One user can have many expenses)
- categories → expenses: One-to-Many (One category can have many expenses)
- payment_methods → expenses: One-to-Many (One payment method can have many expenses)
- expenses → expense_audit: One-to-Many (One expense can have many audit records)

### ER Diagram

### Schema Details
https://dbdiagram.io/d/6a7fecc5c6a866c907715266