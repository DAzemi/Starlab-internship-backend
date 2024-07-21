CREATE TABLE orders (
  orderId varchar(255) NOT NULL PRIMARY KEY,
  amount_total varchar(255) NOT NULL,
  user_id int(11) NOT NULL,
  order_date timestamp NOT NULL DEFAULT current_timestamp(),
  userName varchar(255) NOT NULL,
  street_address varchar(255) NOT NULL,
  city varchar(255) NOT NULL,
  country varchar(255) NOT NULL,
  postal_code varchar(255) NOT NULL,
  shipping_method varchar(255) NOT NULL,
  shipping_rate_data varchar(255) NOT NULL,
  phone_number varchar(20) NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(userId)
);
  /*Databaza ka emrin E-commerce ku mund ta krijoni me sintaksen CREATE DATABASE `e-commerce`;