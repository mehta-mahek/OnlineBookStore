create database books;
use books;
CREATE TABLE IF NOT EXISTS `Customer` (
  `idCustomer` INT NOT NULL AUTO_INCREMENT,
  `Customer_name` VARCHAR(100) NULL,
  `Customer_address` VARCHAR(255) NULL,
  `Customer_email` VARCHAR(100) NULL,
  `Customer_PhoneNumber` VARCHAR(15) NULL,
  PRIMARY KEY (`idCustomer`),
  UNIQUE INDEX `Customer_email_UNIQUE` (`Customer_email` ASC),
  UNIQUE INDEX `Customer_PhoneNumber_UNIQUE` (`Customer_PhoneNumber` ASC)
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Book`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Book` (
  `idBook` INT NOT NULL AUTO_INCREMENT,
  `Book_Name` VARCHAR(100) NOT NULL,
  `Publisher_name` VARCHAR(100) NOT NULL,
  `Author` VARCHAR(100) NOT NULL,
  `Book_Rating` VARCHAR(10) NULL,
  PRIMARY KEY (`idBook`)
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `E_Book`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `E_Book` (
  `idBook` INT NOT NULL,
  `online_copy` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idBook`),
  CONSTRAINT `fk_E_Book_Book`
    FOREIGN KEY (`idBook`)
    REFERENCES `Book` (`idBook`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `FeedBack`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `FeedBack` (
  `idFeedBack` INT NOT NULL AUTO_INCREMENT,
  `Review` VARCHAR(255) NULL,
  `Book_Rating` VARCHAR(10) NULL,
  PRIMARY KEY (`idFeedBack`)
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Order` (
  `Order_ID` INT NOT NULL AUTO_INCREMENT,
  `Customer_idCustomer` INT NOT NULL,
  `Order_date` DATE NOT NULL,
  `Quantity` INT NOT NULL,
  `Amount` INT NOT NULL,
  `idBook` INT NULL,
  PRIMARY KEY (`Order_ID`),
  CONSTRAINT `fk_Order_Customer`
    FOREIGN KEY (`Customer_idCustomer`)
    REFERENCES `Customer` (`idCustomer`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Order_Book`
    FOREIGN KEY (`idBook`)
    REFERENCES `Book` (`idBook`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Payment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Payment` (
  `P_Id` INT NOT NULL AUTO_INCREMENT,
  `Order_Id` INT NOT NULL,
  `PaymentMethod` VARCHAR(45) NULL,
  `Payment_Date` DATE NULL,
  `Payment_status` VARCHAR(45) NULL,
  `Amount` INT NOT NULL,
  PRIMARY KEY (`P_Id`),
  CONSTRAINT `fk_Payment_Order`
    FOREIGN KEY (`Order_Id`)
    REFERENCES `Order` (`Order_ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Delivery`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Delivery` (
  `D_Id` INT NOT NULL AUTO_INCREMENT,
  `Order_Id` INT NOT NULL,
  `D_date` DATE NOT NULL,
  `D_status` VARCHAR(45) NULL,
  `D_address` VARCHAR(255) NULL,
  PRIMARY KEY (`D_Id`),
  CONSTRAINT `fk_Delivery_Order`
    FOREIGN KEY (`Order_Id`)
    REFERENCES `Order` (`Order_ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Supplier`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Supplier` (
  `supplier_id` INT NOT NULL AUTO_INCREMENT,
  `supplier_name` VARCHAR(100) NOT NULL,
  `supplier_contact` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `Inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Inventory` (
  `inv_id` INT NOT NULL AUTO_INCREMENT,
  `inv_num` VARCHAR(50) NOT NULL,
  `inv_items` VARCHAR(255) NOT NULL,
  `inv_type` VARCHAR(100) NOT NULL,
  `Book_id` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `Stock_Quantity` INT NOT NULL,
  `last_update` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inv_id`),
  CONSTRAINT `fk_Inventory_Book`
    FOREIGN KEY (`Book_id`)
    REFERENCES `Book` (`idBook`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Inventory_Supplier`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `Supplier` (`supplier_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)

INSERT INTO Customer (Customer_name, Customer_address, Customer_email, Customer_PhoneNumber) VALUES
('John Doe', '123 Elm St', 'john.doe@email.com', '1234567890'),
('Jane Smith', '456 Pine St', 'jane.smith@email.com', '2345678901'),
('Alice Brown', '789 Oak St', 'alice.brown@email.com', '3456789012'),
('Bob Johnson', '321 Maple St', 'bob.johnson@email.com', '4567890123'),
('Emma Davis', '654 Cedar St', 'emma.davis@email.com', '5678901234'),
('Tom Wilson', '987 Birch St', 'tom.wilson@email.com', '6789012345'),
('Sara Lee', '147 Spruce St', 'sara.lee@email.com', '7890123456'),
('Mike Clark', '258 Willow St', 'mike.clark@email.com', '8901234567'),
('Lisa White', '369 Ash St', 'lisa.white@email.com', '9012345678'),
('Peter Green', '741 Poplar St', 'peter.green@email.com', '0123456789');

INSERT INTO Book (Book_Name, Publisher_name, Author, Book_Rating) VALUES
('The Great Gatsby', 'Scribner', 'F. Scott Fitzgerald', '4.5'),
('1984', 'Secker & Warburg', 'George Orwell', '4.8'),
('To Kill a Mockingbird', 'J.B. Lippincott', 'Harper Lee', '4.7'),
('Pride and Prejudice', 'T. Egerton', 'Jane Austen', '4.6'),
('The Catcher in the Rye', 'Little, Brown', 'J.D. Salinger', '4.3'),
('Moby Dick', 'Harper & Brothers', 'Herman Melville', '4.2'),
('Brave New World', 'Chatto & Windus', 'Aldous Huxley', '4.5'),
('The Hobbit', 'Allen & Unwin', 'J.R.R. Tolkien', '4.9'),
('Fahrenheit 451', 'Ballantine Books', 'Ray Bradbury', '4.4'),
('Jane Eyre', 'Smith, Elder & Co.', 'Charlotte Brontë', '4.6');

INSERT INTO E_Book (idBook, online_copy) VALUES
(1, 'http://ebooks.com/gatsby.pdf'),
(2, 'http://ebooks.com/1984.epub'),
(3, 'http://ebooks.com/mockingbird.pdf'),
(4, 'http://ebooks.com/pride.epub'),
(5, 'http://ebooks.com/catcher.pdf'),
(6, 'http://ebooks.com/moby.epub'),
(7, 'http://ebooks.com/brave.pdf'),
(8, 'http://ebooks.com/hobbit.epub'),
(9, 'http://ebooks.com/fahrenheit.pdf'),
(10, 'http://ebooks.com/jane.epub');

INSERT INTO `Order` (Customer_idCustomer, Order_date, Quantity, Amount, idBook) VALUES
(1, '2025-03-01', 2, 30, 1),
(2, '2025-03-02', 1, 15, 2),
(3, '2025-03-03', 3, 45, 3),
(4, '2025-03-04', 1, 20, 4),
(5, '2025-03-05', 2, 25, 5),
(6, '2025-03-06', 1, 18, 6),
(7, '2025-03-07', 4, 60, 7),
(8, '2025-03-08', 2, 35, 8),
(9, '2025-03-09', 1, 22, 9),
(10, '2025-03-10', 3, 50, 10);

INSERT INTO Payment (Order_Id, PaymentMethod, Payment_Date, Payment_status, Amount) VALUES
(1, 'Credit Card', '2025-03-01', 'Completed', 30),
(2, 'PayPal', '2025-03-02', 'Completed', 15),
(3, 'Debit Card', '2025-03-03', 'Pending', 45),
(4, 'Credit Card', '2025-03-04', 'Completed', 20),
(5, 'PayPal', '2025-03-05', 'Completed', 25),
(6, 'Debit Card', '2025-03-06', 'Pending', 18),
(7, 'Credit Card', '2025-03-07', 'Completed', 60),
(8, 'PayPal', '2025-03-08', 'Completed', 35),
(9, 'Debit Card', '2025-03-09', 'Pending', 22),
(10, 'Credit Card', '2025-03-10', 'Completed', 50);

INSERT INTO Delivery (Order_Id, D_date, D_status, D_address) VALUES
(1, '2025-03-03', 'Delivered', '123 Elm St'),
(2, '2025-03-04', 'Shipped', '456 Pine St'),
(3, '2025-03-05', 'Processing', '789 Oak St'),
(4, '2025-03-06', 'Delivered', '321 Maple St'),
(5, '2025-03-07', 'Shipped', '654 Cedar St'),
(6, '2025-03-08', 'Processing', '987 Birch St'),
(7, '2025-03-09', 'Delivered', '147 Spruce St'),
(8, '2025-03-10', 'Shipped', '258 Willow St'),
(9, '2025-03-11', 'Processing', '369 Ash St'),
(10, '2025-03-12', 'Delivered', '741 Poplar St');

INSERT INTO Supplier (supplier_name, supplier_contact) VALUES
('BookWorld Inc.', 'contact@bookworld.com'),
('LitDistributors', 'sales@litdist.com'),
('PageTurners Ltd.', 'info@pageturners.com'),
('ReadWell Supplies', 'supply@readwell.com'),
('NovelStock Co.', 'orders@novelstock.com'),
('LitSource', 'support@litsource.com'),
('BookHaven', 'sales@bookhaven.com'),
('TextTrade', 'trade@texttrade.com'),
('PubDirect', 'direct@pubdirect.com'),
('WordWarehouse', 'info@wordwarehouse.com');

INSERT INTO Inventory (inv_num, inv_items, inv_type, Book_id, supplier_id, Stock_Quantity) VALUES
('INV001', 'The Great Gatsby', 'Physical', 1, 1, 50),
('INV002', '1984', 'Physical', 2, 2, 30),
('INV003', 'To Kill a Mockingbird', 'Physical', 3, 3, 40),
('INV004', 'Pride and Prejudice', 'Physical', 4, 4, 25),
('INV005', 'The Catcher in the Rye', 'Physical', 5, 5, 35),
('INV006', 'Moby Dick', 'Physical', 6, 6, 20),
('INV007', 'Brave New World', 'Physical', 7, 7, 45),
('INV008', 'The Hobbit', 'Physical', 8, 8, 60),
('INV009', 'Fahrenheit 451', 'Physical', 9, 9, 15),
('INV010', 'Jane Eyre', 'Physical', 10, 10, 55);
-- A basic query to retrieve all customer names and emails.
SELECT Customer_name, Customer_email
FROM Customer;
-- Create a new table called 'Review'
CREATE TABLE IF NOT EXISTS `Review` (
    `idReview` INT NOT NULL AUTO_INCREMENT,
    `idFeedBack` INT NOT NULL,
    `Comment` VARCHAR(255) NULL,
    PRIMARY KEY (`idReview`),
    CONSTRAINT `fk_Review_FeedBack`
        FOREIGN KEY (`idFeedBack`)
        REFERENCES `FeedBack` (`idFeedBack`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE = InnoDB;

-- Altering Book Table
ALTER TABLE `Book`
ADD COLUMN `Publication_Year` INT NULL;

-- Drop a table
DROP TABLE IF EXISTS `Review`;


-- Demonstrate PRIMARY KEY, FOREIGN KEY, UNIQUE, and NOT NULL
INSERT INTO Book (Book_Name, Publisher_name, Author, Book_Rating)
VALUES ('New Book', 'New Pub', 'New Author', '4.0');
-- This will fail if any NOT NULL column (e.g., Book_Name) is omitted

-- Basic SQL Structures 

-- SELECT
SELECT * FROM Customer WHERE idCustomer = 1;

-- Insert
ALTER TABLE Customer 
MODIFY COLUMN idCustomer INT UNSIGNED NOT NULL AUTO_INCREMENT;

-- Then: modify the `Order` table to match
ALTER TABLE `Order` 
MODIFY COLUMN Customer_idCustomer INT UNSIGNED NOT NULL;



INSERT INTO Customer (Customer_name, Customer_address, Customer_email, Customer_PhoneNumber)
VALUES ('New User', '1000 New St', 'new.user@email.com', '1112223333');

-- Update
UPDATE Customer
SET Customer_address = '1001 Updated St'
WHERE idCustomer = 11;

-- Delete
DELETE FROM Customer
WHERE idCustomer = 11;

-- Query with WHERE, ORDER BY, and LIMIT
SELECT Book_Name, Author, Book_Rating
FROM Book
WHERE Book_Rating > 4.5
ORDER BY Book_Rating DESC
LIMIT 3;

-- Update multiple rows
SET SQL_SAFE_UPDATES = 0;

UPDATE `Order`
SET Quantity = Quantity + 1
WHERE Order_date < '2025-03-05';

SET SQL_SAFE_UPDATES = 1; -- (optional) turn it back on


-- Delete based on condition
SET SQL_SAFE_UPDATES = 0;
DELETE FROM Payment
WHERE Payment_status = 'Pending';
SET SQL_SAFE_UPDATES = 1;

-- UNION (combine unique rows from two queries)
SELECT Customer_name FROM Customer WHERE idCustomer <= 5
UNION
SELECT Customer_name FROM Customer WHERE idCustomer > 5;

-- INTERSECT
SELECT Customer_idCustomer FROM `Order` WHERE Order_date LIKE '2025-03%'
AND Customer_idCustomer IN (SELECT Customer_idCustomer FROM Payment WHERE Amount > 20);
 
-- EXCEPT
SELECT idCustomer FROM Customer
WHERE idCustomer NOT IN (SELECT Customer_idCustomer FROM `Order`);

-- Calculate total amount spent per customer
SELECT c.Customer_name, SUM(o.Amount) as Total_Spent
FROM Customer c
JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer
GROUP BY c.Customer_name
HAVING SUM(o.Amount) > 50;

-- Find customers who ordered books with rating > 4.5
SELECT Customer_name
FROM Customer
WHERE idCustomer IN (
    SELECT Customer_idCustomer
    FROM `Order`
    WHERE idBook IN (
        SELECT idBook
        FROM Book
        WHERE CAST(Book_Rating AS DECIMAL(3,1)) > 4.5
    )
);

-- Find average rating and count of books
SELECT AVG(CAST(Book_Rating AS DECIMAL(3,1))) as Avg_Rating, COUNT(*) as Book_Count
FROM Book;

-- INNER JOIN (customers with orders)
SELECT c.Customer_name, o.Order_ID, o.Order_date
FROM Customer c
INNER JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer;

-- LEFT JOIN (all customers, orders if any)
SELECT c.Customer_name, o.Order_ID
FROM Customer c
LEFT JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer;

-- RIGHT JOIN (all orders, customers if any)
SELECT c.Customer_name, o.Order_ID
FROM Customer c
RIGHT JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer;

-- FULL JOIN (all records, workaround for MySQL)
SELECT c.Customer_name, o.Order_ID
FROM Customer c
LEFT JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer
UNION
SELECT c.Customer_name, o.Order_ID
FROM Customer c
RIGHT JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer
WHERE c.idCustomer IS NULL;

-- Create a view for customer order summary
CREATE VIEW CustomerOrderSummary AS
SELECT c.Customer_name, COUNT(o.Order_ID) as Order_Count, SUM(o.Amount) as Total_Amount
FROM Customer c
LEFT JOIN `Order` o ON c.idCustomer = o.Customer_idCustomer
GROUP BY c.Customer_name;

-- Query the view
SELECT * FROM CustomerOrderSummary
WHERE Order_Count > 0
ORDER BY Total_Amount DESC;

SHOW VARIABLES LIKE 'secure_file_priv';

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Customer;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE"C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\customers.csv"
INTO TABLE Customer
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES  -- Skip the header row if present
(idCustomer, Customer_name, Customer_address, Customer_email, Customer_PhoneNumber);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Book;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\books.csv"
INTO TABLE Book
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(idBook, Book_Name, Publisher_name, Author, Book_Rating);

ALTER TABLE `Order`
MODIFY COLUMN Customer_idCustomer VARCHAR(200);
ALTER TABLE `Order`
DROP FOREIGN KEY fk_Order_Customer;

ALTER TABLE Customer
MODIFY COLUMN idCustomer VARCHAR(200);

ALTER TABLE `Order`
MODIFY COLUMN Customer_idCustomer VARCHAR(200);

ALTER TABLE `Order`
ADD CONSTRAINT fk_Order_Customer
FOREIGN KEY (Customer_idCustomer)
REFERENCES Customer(idCustomer)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `Order`
MODIFY COLUMN Order_ID INT NOT NULL AUTO_INCREMENT;

SET FOREIGN_KEY_CHECKS = 0;

-- Now try loading your CSV
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\order.csv"
INTO TABLE `Order`
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(Customer_idCustomer, Order_date, Quantity, Amount, idBook);


SET FOREIGN_KEY_CHECKS = 1;


SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `E_Book`;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\ebooks.csv"
INTO TABLE E_Book
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(idBook, online_copy);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `Payment`;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\payment.csv"
INTO TABLE Payment
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(P_Id, Order_Id, PaymentMethod, Payment_Date, Payment_status, Amount);
ALTER TABLE Delivery MODIFY D_address VARCHAR(1000);
ALTER TABLE Delivery MODIFY D_address VARCHAR(100);
SHOW CREATE TABLE Delivery;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `Delivery`;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\delivery_data.csv"
INTO TABLE Delivery
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(D_Id, Order_Id, D_date, D_status, D_address);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `Supplier`;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\suppliers.csv"
INTO TABLE Supplier
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(supplier_id, supplier_name, supplier_contact);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `Inventory`;
SET FOREIGN_KEY_CHECKS = 1;
LOAD DATA INFILE "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\inventory.csv"
INTO TABLE Inventory
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(inv_id, inv_num, inv_items, inv_type, Book_id, supplier_id, Stock_Quantity);

