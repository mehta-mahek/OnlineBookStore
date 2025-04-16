USE bookstore;
 
 
CREATE TABLE bookji (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NOT NULL
);
 
INSERT INTO bookji (title, price, image_url) VALUES
('The Great Novel', 500, 'image/greatnovel.jpg'),
('Harry Potter 1', 400, 'image/harrypotter.jpg'),
('Harry Potter Part 2', 400, 'image/HarryPotter2.jpg'),
('Rich Dad Poor Dad', 350, 'image/rich.jpg'),
('Atomic Habits', 600, 'image/atomichabits.jpg'),
('The Psychology of Money', 550, 'image/Money.jpg'),
('Think and Grow Rich', 450, 'image/grow.jpg'),
('Harry Potter Part 3', 350, 'image/harry3.jpg'),
('Minion Illumination', 550, 'image/minionillumination.jpg'),
('Minion', 650, 'image/minion.jpg');