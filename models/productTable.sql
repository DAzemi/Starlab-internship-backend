CREATE TABLE products (
  productId int AUTO_INCREMENT PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text DEFAULT NULL,
  price decimal(10,2) NOT NULL,
  image_url varchar(255) NOT NULL,
  category_id int Not Null,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(categoryId)
);
  /*Databaza ka emrin E-commerce ku mund ta krijoni me sintaksen CREATE DATABASE `e-commerce`;