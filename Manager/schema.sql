DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(55) NOT NULL,
  department_name VARCHAR(55) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT(100) NOT NULL,
  primary key(item_id)
);

SELECT * FROM products;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Minecraft: Limited Edition", "Video Games", 30.00, 100),
  ("Monster Hunter World", "Video Games", 59.99, 100),
  ("Amy's Breakfast Burrito", "Food and Drink", 2.49, 50),
  ("Northface Jacket", "Apparel", 99.99, 100),
  ("YSL Pants", "Apparel", 250, 25),
  ("Gucci Slippers", "Necessities", 250, 20),
  ("Pineapple Express", "Films", 25, 100),
  ("Leather Couch", "Furniture", 800, 20),
  ("Sorry", "Board Games", 30.50, 35),
  ("Limited Edition: Spongebob Sorry", "Board Games", 1000, 1),
  ("Settlers of Catan", "Board Games", 35, 75);
