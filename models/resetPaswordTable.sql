CREATE TABLE resetPasswords (
    resetPasswordId INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    reset_token VARCHAR(32) NOT NULL,
    expiration_time DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(userId)
);
  /*Databaza ka emrin E-commerce ku mund ta krijoni me sintaksen CREATE DATABASE `e-commerce`;