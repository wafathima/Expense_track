┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│    users    │          │  expenses   │          │ categories  │
├─────────────┤          ├─────────────┤          ├─────────────┤
│ id (PK)     │◄─────────│ user_id (FK)│          │ id (PK)     │
│ name        │          │ id (PK)     │───────►  │ name        │
│ email       │          │ title       │          │ icon        │
│ created_at  │          │ description │          │ color       │
└─────────────┘          │ amount      │          │ created_at  │
                         │ expense_date│          └─────────────┘
                         │ category_id │
                         │ payment_    │          ┌─────────────┐
                         │   method_id │          │payment_     │
                         │ created_at  │          │  methods    │
                         │ updated_at  │          ├─────────────┤
                         └─────────────┘          │ id (PK)     │
                              │                   │ name        │
                              │                   │ created_at  │
                              │                   └─────────────┘
                              ▼
                         ┌─────────────┐
                         │expense_audit│
                         ├─────────────┤
                         │ id (PK)     │
                         │ expense_id  │
                         │   (FK)      │
                         │ action      │
                         │ created_at  │
                         └─────────────┘
