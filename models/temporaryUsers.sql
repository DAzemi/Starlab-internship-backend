CREATE TABLE temporaryUsers(
  userId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  isVerified TINYINT(1) NOT NULL,
  role VARCHAR(255) DEFAULT 'user',
  verification_token VARCHAR(64)
);
  /*Databaza ka emrin E-commerce ku mund ta krijoni me sintaksen CREATE DATABASE `e-commerce`;