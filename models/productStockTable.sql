CREATE TABLE product_stock (
  product_stock_id int AUTO_INCREMENT PRIMARY KEY,
  product_id int NOT NULL,
  sasia int NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(productId)
);
  /*Databaza ka emrin E-commerce ku mund ta krijoni me sintaksen CREATE DATABASE `e-commerce`;