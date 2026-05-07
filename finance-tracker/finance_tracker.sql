-- Create Database
CREATE DATABASE finance_tracker;
USE finance_tracker;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL
);

-- Insert default categories
INSERT INTO categories (name, type) VALUES
('Salary', 'income'),
('Freelance', 'income'),
('Food', 'expense'),
('Transport', 'expense'),
('Shopping', 'expense');

-- TRANSACTIONS TABLE
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);




INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES

-- Rahul (user_id = 1)
(1, 1, 50000, 'income', 'Monthly Salary', '2026-03-01'),
(1, 3, 1200, 'expense', 'Lunch and dinner', '2026-03-02'),
(1, 4, 800, 'expense', 'Bus and metro', '2026-03-03'),
(1, 5, 2500, 'expense', 'Clothing', '2026-03-04'),
(1, 2, 3000, 'expense', 'Electricity bill', '2026-03-05'),
(1, 1, 1500, 'expense', 'Medical checkup', '2026-03-06');