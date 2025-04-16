
# 📚 Bookstore Database – `bookstoreji.sql`

This project contains the SQL schema for a **Bookstore Management System**. The SQL file initializes a database named `books` and defines various tables to manage customers, books, e-books, and related data.

---

## 📂 Database Overview

- **Database Name**: `books`

### 📋 Tables Included

1. **Customer**
   - Stores customer details.
   - Fields: `idCustomer`, `Customer_name`, `Customer_address`, `Customer_email`, `Customer_PhoneNumber`
   - Unique constraints on email and phone number.

2. **Book**
   - Stores information about physical books.
   - Fields: `idBook`, `Book_Name`, `Publisher_name`, `Author`, `Book_Rating`

3. **E_Book**
   - Stores information about digital books (E-books).
   - Fields are likely to include E-book-specific metadata (inferred from naming, pending confirmation in full file).

> *Additional tables might be present in the complete SQL file.*

---

## 🛠 How to Use

1. **Setup MySQL Server** on your local machine.
2. Open a MySQL client (like MySQL Workbench or command-line).
3. Run the SQL file:

```bash
mysql -u [username] -p < bookstoreji.sql
```

4. After execution, the database `books` will be created with its tables.

---

## ✅ Features

- Organized schema for a bookstore application.
- Data integrity ensured with primary keys and unique constraints.
- Ready for extension to include features like Orders, Payments, Inventory, etc.

---

## 📌 Requirements

- MySQL 5.7 or above
- A SQL client or terminal access to a MySQL server

---

## 📞 Contact

For questions or contributions, feel free to reach out to the project maintainer.
